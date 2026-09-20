import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  sendEmailVerification,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithEmailLink,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const googleProvider = new GoogleAuthProvider();

const EMAIL_LINK_KEY = "campusbuddy_email_for_link";

export default function Auth({ onSuccess }) {
  const [signup, setSignup] = useState(false);
  const [authMethod, setAuthMethod] = useState("password");

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /*
   * Creates a student profile only when one does not already exist.
   *
   * IMPORTANT:
   * We never overwrite the role of an existing user.
   * This protects admin accounts from accidentally becoming students.
   */
  const ensureUserProfile = async (firebaseUser, extraData = {}) => {
    if (!firebaseUser) return;

    const userRef = doc(db, "users", firebaseUser.uid);
    const existing = await getDoc(userRef);

    if (existing.exists()) {
      return existing.data();
    }

    const profile = {
      name:
        extraData.name?.trim() ||
        firebaseUser.displayName ||
        firebaseUser.phoneNumber ||
        firebaseUser.email?.split("@")[0] ||
        "Campus student",

      studentId: extraData.studentId?.trim() || "",
      course: extraData.course?.trim() || "",
      year: extraData.year || "",

      email: firebaseUser.email || extraData.email?.trim() || "",
      phone: firebaseUser.phoneNumber || extraData.phone?.trim() || "",

      createdAt: serverTimestamp(),
    };

    await setDoc(userRef, profile);

    return profile;
  };

  /*
   * Finish authentication and send the user into CampusBuddy.
   */
  const finishAuth = async (firebaseUser, extraData = {}) => {
    await ensureUserProfile(firebaseUser, extraData);

    if (onSuccess) {
      onSuccess(firebaseUser);
    }
  };

  /*
   * Handle normal email/password login and signup.
   */
  const submitPasswordAuth = async (event) => {
    event.preventDefault();

    clearMessages();
    setLoading(true);

    try {
      if (signup) {
        const result = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await ensureUserProfile(result.user, {
          name,
          studentId,
          course,
          year,
          email,
        });

        /*
         * Optional email verification.
         * The user can still enter CampusBuddy after creating the account.
         */
        try {
          await sendEmailVerification(result.user);
        } catch (verificationError) {
          console.warn(
            "Email verification could not be sent:",
            verificationError
          );
        }

        await finishAuth(result.user, {
          name,
          studentId,
          course,
          year,
          email,
        });
      } else {
        const result = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await finishAuth(result.user);
      }
    } catch (err) {
      console.error(err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /*
   * Google authentication.
   */
  const handleGoogleSignIn = async () => {
    clearMessages();
    setLoading(true);

    try {
      const { signInWithPopup } = await import("firebase/auth");

      const result = await signInWithPopup(auth, googleProvider);

      await finishAuth(result.user);
    } catch (err) {
      console.error(err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /*
   * Send passwordless email sign-in link.
   */
  const handleSendEmailLink = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(
        auth,
        email.trim(),
        actionCodeSettings
      );

      localStorage.setItem(EMAIL_LINK_KEY, email.trim());

      setEmailLinkSent(true);
      setSuccess(
        "Sign-in link sent! Check your email and open the link on this device."
      );
    } catch (err) {
      console.error(err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /*
   * Automatically completes passwordless email login
   * when Firebase redirects back to the app.
   */
  useEffect(() => {
    const completeEmailLinkSignIn = async () => {
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        return;
      }

      let savedEmail = localStorage.getItem(EMAIL_LINK_KEY);

      if (!savedEmail) {
        savedEmail = window.prompt(
          "Please enter the email address you used for CampusBuddy."
        );
      }

      if (!savedEmail) {
        setError(
          "Please enter the same email address you used to request the sign-in link."
        );
        return;
      }

      setLoading(true);

      try {
        const result = await signInWithEmailLink(
          auth,
          savedEmail,
          window.location.href
        );

        localStorage.removeItem(EMAIL_LINK_KEY);

        await finishAuth(result.user);

        setSuccess("Email verified. Welcome back to CampusBuddy!");
      } catch (err) {
        console.error(err);
        setError(getFirebaseErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    completeEmailLinkSignIn();
  }, []);

  /*
   * Create invisible reCAPTCHA for Firebase phone authentication.
   */
  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved.
        },
        "expired-callback": () => {
          window.recaptchaVerifier = null;
        },
      }
    );

    return window.recaptchaVerifier;
  };

  /*
   * Send phone OTP.
   */
  const handleSendPhoneOtp = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);

    try {
      const verifier = setupRecaptcha();

      const formattedPhone = phone.trim();

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        verifier
      );

      setConfirmationResult(result);

      setSuccess("OTP sent successfully. Check your phone.");
    } catch (err) {
      console.error(err);

      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          // Ignore reCAPTCHA cleanup errors.
        }

        window.recaptchaVerifier = null;
      }

      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /*
   * Verify phone OTP.
   */
  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!confirmationResult) {
      setError("Please request a new OTP first.");
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp.trim());

      await finishAuth(result.user, {
        name,
        studentId,
        course,
        year,
        phone,
      });

      setSuccess("Phone verified. Welcome to CampusBuddy!");
    } catch (err) {
      console.error(err);
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setSignup((current) => !current);
    clearMessages();

    setConfirmationResult(null);
    setOtp("");
    setEmailLinkSent(false);
  };

  const switchAuthMethod = (method) => {
    setAuthMethod(method);
    clearMessages();

    setConfirmationResult(null);
    setOtp("");
    setEmailLinkSent(false);
  };

  return (
    <div className="auth-shell">
      <div className="auth-background-grid" />

      <div className="auth-layout">
        {/* LEFT BRANDING */}
        <section className="auth-brand-panel">
          <div className="auth-brand">
            <span className="auth-brand-mark">C</span>
            <span>CampusBuddy</span>
          </div>

          <div className="auth-copy">
            <span className="auth-kicker">
              SMART CAMPUS • ONE PLACE
            </span>

            <h1>
              Explore Your Campus,
              <br />
            </h1>

            <h2>
              <span>Experience It Smarter.</span>
            </h2>

            <p>
              Find spaces, discover events, connect with students,
              report lost items and get campus help — without jumping
              between a dozen places.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature">
              <span>01</span>

              <div>
                <strong>Smart campus discovery</strong>
                <small>
                  Spaces, food, events & transport
                </small>
              </div>
            </div>

            <div className="auth-feature">
              <span>02</span>

              <div>
                <strong>Student community</strong>
                <small>
                  Find people studying what you study
                </small>
              </div>
            </div>

            <div className="auth-feature">
              <span>03</span>

              <div>
                <strong>Personal campus profile</strong>
                <small>
                  Your student details stay connected to your account
                </small>
              </div>
            </div>
          </div>

          <div className="auth-proof">
            <span className="auth-proof-dot" />
            <span>Built for the campus, by students.</span>
          </div>
        </section>

        {/* AUTH CARD */}
        <section className="auth-card-wrap">
          <div className="auth-card">
            <div className="auth-card-top">
              <div>
                <span className="auth-card-kicker">
                  {signup ? "NEW STUDENT" : "WELCOME BACK"}
                </span>

                <h2>
                  {signup
                    ? "Create your account"
                    : "Sign in"}
                </h2>

                <p>
                  {signup
                    ? "Set up your CampusBuddy student profile."
                    : "Pick up where you left off."}
                </p>
              </div>

              <div className="auth-orb">✦</div>
            </div>

            {/* AUTH METHOD SWITCHER */}
            <div className="auth-methods">
              <button
                type="button"
                className={
                  authMethod === "password"
                    ? "auth-method active"
                    : "auth-method"
                }
                onClick={() =>
                  switchAuthMethod("password")
                }
              >
                Password
              </button>

              <button
                type="button"
                className={
                  authMethod === "email"
                    ? "auth-method active"
                    : "auth-method"
                }
                onClick={() =>
                  switchAuthMethod("email")
                }
              >
                Email Link
              </button>

              <button
                type="button"
                className={
                  authMethod === "phone"
                    ? "auth-method active"
                    : "auth-method"
                }
                onClick={() =>
                  switchAuthMethod("phone")
                }
              >
                Phone
              </button>
            </div>

            {/* PASSWORD AUTH */}
            {authMethod === "password" && (
              <form
                className="auth-form"
                onSubmit={submitPasswordAuth}
              >
                {signup && (
                  <>
                    <label>
                      <span>Full name</span>

                      <input
                        type="text"
                        placeholder="e.g. Armaan Bassan"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      <span>Student ID</span>

                      <input
                        type="text"
                        placeholder="Your student ID"
                        value={studentId}
                        onChange={(e) =>
                          setStudentId(e.target.value)
                        }
                        required
                      />
                    </label>

                    <div className="auth-form-row">
                      <label>
                        <span>Course</span>

                        <input
                          type="text"
                          placeholder="e.g. CSE"
                          value={course}
                          onChange={(e) =>
                            setCourse(e.target.value)
                          }
                          required
                        />
                      </label>

                      <label>
                        <span>Year</span>

                        <select
                          value={year}
                          onChange={(e) =>
                            setYear(e.target.value)
                          }
                          required
                        >
                          <option value="">
                            Select
                          </option>

                          <option value="1">
                            1st
                          </option>

                          <option value="2">
                            2nd
                          </option>

                          <option value="3">
                            3rd
                          </option>

                          <option value="4">
                            4th
                          </option>
                        </select>
                      </label>
                    </div>
                  </>
                )}

                <label>
                  <span>College email</span>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  <span>Password</span>

                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                    minLength={6}
                  />
                </label>

                <button
                  className="auth-submit"
                  type="submit"
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? "Connecting..."
                      : signup
                      ? "Create my account"
                      : "Enter CampusBuddy"}
                  </span>

                  <strong>→</strong>
                </button>
              </form>
            )}

            {/* EMAIL LINK AUTH */}
            {authMethod === "email" && (
              <form
                className="auth-form"
                onSubmit={handleSendEmailLink}
              >
                <label>
                  <span>Email address</span>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />
                </label>

                <button
                  className="auth-submit"
                  type="submit"
                  disabled={loading || emailLinkSent}
                >
                  <span>
                    {loading
                      ? "Sending..."
                      : emailLinkSent
                      ? "Link Sent ✓"
                      : "Send Sign-In Link"}
                  </span>

                  <strong>→</strong>
                </button>

                {emailLinkSent && (
                  <div className="auth-success">
                    <span>✓</span>

                    <div>
                      <strong>Check your inbox</strong>

                      <small>
                        Open the CampusBuddy link from
                        this device to finish signing in.
                      </small>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* PHONE AUTH */}
            {authMethod === "phone" && (
              <>
                {!confirmationResult ? (
                  <form
                    className="auth-form"
                    onSubmit={handleSendPhoneOtp}
                  >
                    {signup && (
                      <>
                        <label>
                          <span>Full name</span>

                          <input
                            type="text"
                            placeholder="e.g. Armaan Bassan"
                            value={name}
                            onChange={(e) =>
                              setName(e.target.value)
                            }
                            required
                          />
                        </label>

                        <label>
                          <span>Student ID</span>

                          <input
                            type="text"
                            placeholder="Your student ID"
                            value={studentId}
                            onChange={(e) =>
                              setStudentId(e.target.value)
                            }
                            required
                          />
                        </label>

                        <div className="auth-form-row">
                          <label>
                            <span>Course</span>

                            <input
                              type="text"
                              placeholder="e.g. CSE"
                              value={course}
                              onChange={(e) =>
                                setCourse(e.target.value)
                              }
                              required
                            />
                          </label>

                          <label>
                            <span>Year</span>

                            <select
                              value={year}
                              onChange={(e) =>
                                setYear(e.target.value)
                              }
                              required
                            >
                              <option value="">
                                Select
                              </option>

                              <option value="1">
                                1st
                              </option>

                              <option value="2">
                                2nd
                              </option>

                              <option value="3">
                                3rd
                              </option>

                              <option value="4">
                                4th
                              </option>
                            </select>
                          </label>
                        </div>
                      </>
                    )}

                    <label>
                      <span>Phone number</span>

                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        required
                      />
                    </label>

                    <small className="auth-field-help">
                      Include your country code, for example
                      +91 for India.
                    </small>

                    <button
                      className="auth-submit"
                      type="submit"
                      disabled={loading}
                    >
                      <span>
                        {loading
                          ? "Sending OTP..."
                          : "Send OTP"}
                      </span>

                      <strong>→</strong>
                    </button>
                  </form>
                ) : (
                  <form
                    className="auth-form"
                    onSubmit={handleVerifyOtp}
                  >
                    <label>
                      <span>Verification code</span>

                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value)
                        }
                        maxLength={6}
                        required
                      />
                    </label>

                    <button
                      className="auth-submit"
                      type="submit"
                      disabled={loading}
                    >
                      <span>
                        {loading
                          ? "Verifying..."
                          : "Verify Phone"}
                      </span>

                      <strong>→</strong>
                    </button>

                    <button
                      type="button"
                      className="auth-secondary-button"
                      onClick={() => {
                        setConfirmationResult(null);
                        setOtp("");
                        clearMessages();
                      }}
                    >
                      ← Use another number
                    </button>
                  </form>
                )}
              </>
            )}

            {/* GOOGLE */}
            <div className="auth-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <button
              type="button"
              className="auth-google"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <span className="google-icon">G</span>

              <span>
                {loading
                  ? "Connecting..."
                  : "Continue with Google"}
              </span>
            </button>

            {/* ERROR */}
            {error && (
              <div className="auth-error">
                <span>!</span>

                <div>{error}</div>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="auth-success">
                <span>✓</span>

                <div>{success}</div>
              </div>
            )}

            {/* SWITCH SIGNUP / LOGIN */}
            <div className="auth-divider">
              <span>ACCOUNT ACCESS</span>
            </div>

            <button
              type="button"
              className="auth-switch"
              onClick={switchMode}
            >
              {signup
                ? "Already have an account? Sign in"
                : "New here? Create a student account"}
            </button>

            <p className="auth-note">
              Firebase securely handles your authentication.
              Your student profile is stored separately in
              CampusBuddy's database.
            </p>
          </div>
        </section>
      </div>

      {/* Firebase phone authentication reCAPTCHA */}
      <div id="recaptcha-container" />
    </div>
  );
}

/*
 * Firebase error → user-friendly message
 */
function getFirebaseErrorMessage(err) {
  const code = err?.code || "";

  const messages = {
    "auth/invalid-credential":
      "Email or password is incorrect.",

    "auth/invalid-email":
      "Please enter a valid email address.",

    "auth/email-already-in-use":
      "This email is already registered.",

    "auth/weak-password":
      "Password must contain at least 6 characters.",

    "auth/user-not-found":
      "No account exists with this email.",

    "auth/wrong-password":
      "Incorrect password.",

    "auth/too-many-requests":
      "Too many attempts. Please wait a moment and try again.",

    "auth/popup-closed-by-user":
      "Google sign-in was cancelled.",

    "auth/popup-blocked":
      "Your browser blocked the Google sign-in popup. Please allow popups and try again.",

    "auth/account-exists-with-different-credential":
      "An account already exists with this email using another sign-in method.",

    "auth/operation-not-allowed":
      "This sign-in method is not enabled in Firebase yet.",

    "auth/unauthorized-domain":
      "This website domain is not authorized in Firebase Authentication.",

    "auth/invalid-action-code":
      "This email sign-in link is invalid or has already been used.",

    "auth/expired-action-code":
      "This email sign-in link has expired. Please request a new one.",

    "auth/missing-phone-number":
      "Please enter a valid phone number.",

    "auth/invalid-phone-number":
      "The phone number format is invalid. Include the country code.",

    "auth/invalid-verification-code":
      "The OTP is incorrect. Please check the code and try again.",

    "auth/code-expired":
      "This OTP has expired. Please request a new one.",

    "auth/captcha-check-failed":
      "reCAPTCHA verification failed. Please try again.",

    "auth/quota-exceeded":
      "Firebase has temporarily limited SMS requests. Please try again later.",
  };

  return (
    messages[code] ||
    err?.message ||
    "Something went wrong. Please try again."
  );
}