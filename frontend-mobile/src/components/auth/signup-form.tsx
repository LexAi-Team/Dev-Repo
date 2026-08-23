"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/firebase/provider";
import PasswordInput from "./password-input";
import PasswordStrength, { validatePassword } from "./password-strength";
import RoleSelector from "./role-selector";
import { getFirebaseAuthErrorMessage } from "../../lib/firebase/errors";

export default function SignupForm() {
  const { signUp, onboardingRequired, syncUserProfile } = useAuth();

  // Basic Account States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "LAWYER" | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Role Specific States - Student
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState<number>(1);

  // Role Specific States - Lawyer
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [location, setLocation] = useState("");

  // Error & Status States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Please enter your full name.";
    
    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Please create a password.";
    } else if (!validatePassword(password)) {
      newErrors.password = "Password does not meet all strength requirements.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!role) {
      newErrors.role = "Please select your profile role.";
    } else {
      if (role === "STUDENT") {
        if (!university.trim()) newErrors.university = "Please enter your university.";
        if (!course.trim()) newErrors.course = "Please enter your course name.";
      } else if (role === "LAWYER") {
        if (!enrollmentNumber.trim()) newErrors.enrollmentNumber = "Bar enrollment number is required.";
        if (!specialization.trim()) newErrors.specialization = "Specialization is required.";
        if (experienceYears < 0) newErrors.experienceYears = "Experience cannot be negative.";
        if (!location.trim()) newErrors.location = "Please enter your location.";
      }
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the Terms of Service and Privacy Policy.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    
    // Package role-specific fields
    const onboardingData: Record<string, unknown> = {};
    if (role === "STUDENT") {
      onboardingData.university = university;
      onboardingData.course = course;
      onboardingData.yearOfStudy = Number(yearOfStudy);
    } else if (role === "LAWYER") {
      onboardingData.enrollmentNumber = enrollmentNumber;
      onboardingData.specialization = specialization;
      onboardingData.experienceYears = Number(experienceYears);
      onboardingData.location = location;
    }
    try {
      await signUp(email, password, name, role!, onboardingData);
    } catch (error: unknown) {
      console.debug("[Auth] Signup failed:", error);
      setErrors({ form: getFirebaseAuthErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  // Google Onboarding Sync Submission
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!role) {
      setErrors({ role: "Please select a role to finalize registration." });
      return;
    }

    const onboardingData: Record<string, unknown> = { name: name || undefined };
    if (role === "STUDENT") {
      if (!university.trim() || !course.trim()) {
        setErrors({ form: "Please fill in all student details." });
        return;
      }
      onboardingData.university = university;
      onboardingData.course = course;
      onboardingData.yearOfStudy = Number(yearOfStudy);
    } else if (role === "LAWYER") {
      if (!enrollmentNumber.trim() || !specialization.trim() || !location.trim()) {
        setErrors({ form: "Please fill in all lawyer details." });
        return;
      }
      onboardingData.enrollmentNumber = enrollmentNumber;
      onboardingData.specialization = specialization;
      onboardingData.experienceYears = Number(experienceYears);
      onboardingData.location = location;
    }

    setLoading(true);
    try {
      await syncUserProfile(role, onboardingData);
    } catch (error: unknown) {
      console.debug("[Auth] Onboarding sync failed:", error);
      setErrors({ form: getFirebaseAuthErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  // Render Google Onboarding Mode
  if (onboardingRequired) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#21170F] tracking-tight">
            Finalize registration
          </h2>
          <p className="text-xs sm:text-sm text-[#766B5F] font-medium">
            How will you use LEXCONNECT?
          </p>
        </div>

        <form onSubmit={handleOnboardingSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3.5 bg-[#C58A35]/10 border border-[#C58A35]/30 rounded-xl text-xs font-bold text-[#A66A22]">
              {errors.form}
            </div>
          )}

          {/* Optional Name field if not retrieved from Google */}
          <div className="space-y-1.5 w-full">
            <label htmlFor="onb-name" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
              Confirm Full Name
            </label>
            <input
              type="text"
              id="onb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-sm"
            />
          </div>

          <RoleSelector selectedRole={role} onChange={(r) => setRole(r)} error={errors.role} />

          {/* Render Dynamic Role Specific Fields for Google Onboarding */}
          {role === "STUDENT" && (
            <div className="space-y-4 pt-2 border-t border-[#E2D5C1]/40">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="onb-uni" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    University
                  </label>
                  <input
                    type="text"
                    id="onb-uni"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="National Law School"
                    className="block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="onb-course" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Course
                  </label>
                  <input
                    type="text"
                    id="onb-course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="B.A. LL.B."
                    className="block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="onb-year" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Year of Study
                </label>
                <select
                  id="onb-year"
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(Number(e.target.value))}
                  className="block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-sm"
                >
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                  <option value={5}>Year 5</option>
                </select>
              </div>
            </div>
          )}

          {role === "LAWYER" && (
            <div className="space-y-4 pt-2 border-t border-[#E2D5C1]/40">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="onb-enroll" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Enrollment No.
                  </label>
                  <input
                    type="text"
                    id="onb-enroll"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="KAR/2022/104"
                    className="block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="onb-spec" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Specialization
                  </label>
                  <input
                    type="text"
                    id="onb-spec"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Criminal Advocacy"
                    className="block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="onb-exp" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    id="onb-exp"
                    value={experienceYears}
                    min={0}
                    onChange={(e) => setExperienceYears(Math.max(0, Number(e.target.value)))}
                    className="block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="onb-loc" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Location (City)
                  </label>
                  <input
                    type="text"
                    id="onb-loc"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="New Delhi"
                    className="block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full h-[48px] bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? "Completing Profile..." : "Finalize Profile →"}
          </button>
        </form>
      </div>
    );
  }

  // Render Default Registration Mode
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-2 text-center md:text-left">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#21170F] tracking-tight">
          Create your LEXCONNECT account
        </h2>
        <p className="text-xs sm:text-sm text-[#766B5F] font-medium">
          Start your journey into the future of legal practice.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3.5 bg-[#C58A35]/10 border border-[#C58A35]/30 rounded-xl text-xs font-bold text-[#A66A22]">
            {errors.form}
          </div>
        )}

        {/* Full Name Field */}
        <div className="space-y-1.5 w-full">
          <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={`block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border rounded-xl outline-none transition-all ${
              errors.name ? "border-[#C58A35] focus:ring-1 focus:ring-[#C58A35]" : "border-[#E2D5C1] focus:ring-1 focus:ring-[#A66A22]"
            } placeholder:text-[#766B5F]/50 text-sm`}
          />
          {errors.name && (
            <p id="name-error" className="text-xs font-semibold text-[#A66A22] mt-1">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5 w-full">
          <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border rounded-xl outline-none transition-all ${
              errors.email ? "border-[#C58A35] focus:ring-1 focus:ring-[#C58A35]" : "border-[#E2D5C1] focus:ring-1 focus:ring-[#A66A22]"
            } placeholder:text-[#766B5F]/50 text-sm`}
          />
          {errors.email && (
            <p id="email-error" className="text-xs font-semibold text-[#A66A22] mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Fields */}
        <div className="space-y-3">
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="Create a password"
          />
          <PasswordStrength password={password} />

          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
          />
        </div>

        {/* Role Selector Card Set */}
        <div className="py-2">
          <RoleSelector selectedRole={role} onChange={(r) => setRole(r)} error={errors.role} />
        </div>

        {/* Role-Specific Form Fields */}
        {role === "STUDENT" && (
          <div className="space-y-4 pt-4 border-t border-[#E2D5C1]/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A66A22]">Student Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="uni" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  University
                </label>
                <input
                  type="text"
                  id="uni"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="NLSUI Bangalore"
                  className={`block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] text-sm ${
                    errors.university ? "border-[#C58A35]" : "border-[#E2D5C1]"
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="course" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Course Name
                </label>
                <input
                  type="text"
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="B.A. LL.B."
                  className={`block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] text-sm ${
                    errors.course ? "border-[#C58A35]" : "border-[#E2D5C1]"
                  }`}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="year" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                Year of Study
              </label>
              <select
                id="year"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                className="block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] text-sm"
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
                <option value={5}>Year 5</option>
              </select>
            </div>
          </div>
        )}

        {role === "LAWYER" && (
          <div className="space-y-4 pt-4 border-t border-[#E2D5C1]/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A66A22]">Lawyer Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="enroll" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Enrollment No.
                </label>
                <input
                  type="text"
                  id="enroll"
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                  placeholder="KAR/2024/200"
                  className={`block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] text-sm ${
                    errors.enrollmentNumber ? "border-[#C58A35]" : "border-[#E2D5C1]"
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="spec" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Specialization
                </label>
                <input
                  type="text"
                  id="spec"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Constitutional Law"
                  className={`block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] text-sm ${
                    errors.specialization ? "border-[#C58A35]" : "border-[#E2D5C1]"
                  }`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="exp" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="exp"
                  value={experienceYears}
                  min={0}
                  onChange={(e) => setExperienceYears(Math.max(0, Number(e.target.value)))}
                  className="block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="loc" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Location (City)
                </label>
                <input
                  type="text"
                  id="loc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bengaluru"
                  className={`block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] text-sm ${
                    errors.location ? "border-[#C58A35]" : "border-[#E2D5C1]"
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Terms Checkbox */}
        <div className="pt-2">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4.5 w-4.5 accent-[#A66A22] border-[#E2D5C1] rounded focus:ring-0"
            />
            <span className="text-xs text-[#766B5F] font-semibold leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-[#A66A22] underline hover:text-[#C58A35]">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#A66A22] underline hover:text-[#C58A35]">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs font-semibold text-[#A66A22] mt-1">
              {errors.terms}
            </p>
          )}
        </div>

        {/* Primary signup button */}
        <button
          type="submit"
          disabled={loading || !agreeTerms}
          className="flex items-center justify-center w-full h-[48px] bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account →"}
        </button>
      </form>

      {/* Redirect Link */}
      <div className="text-center">
        <p className="text-xs text-[#766B5F] font-semibold">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#A66A22] hover:text-[#C58A35] transition-colors underline font-bold"
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
