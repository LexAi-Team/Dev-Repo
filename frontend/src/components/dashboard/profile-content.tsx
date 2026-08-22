"use client";

import { useEffect, useState } from "react";
import { api, UserProfileResponse } from "@/lib/api";
import {
  Mail,
  Shield,
  ShieldCheck,
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  Edit3,
  Save,
  X,
  Lock,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/app/page-header";
import { PageSkeleton } from "./loading-skeleton";

export default function ProfileContent() {
  const [profileData, setProfileData] = useState<UserProfileResponse["data"]["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [interests, setInterests] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.getProfile();
        if (response && response.status === "success") {
          setProfileData(response.data.user);
        } else {
          setError("Failed to resolve profile contents.");
        }
      } catch (err: unknown) {
        console.debug("[Profile] Load error:", err);
        setError("Unable to connect to the database. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleStartEdit = () => {
    if (!profileData) return;
    setName(profileData.name || "");
    if (profileData.studentProfile) {
      setUniversity(profileData.studentProfile.university || "");
      setCourse(profileData.studentProfile.course || "");
      setYearOfStudy(profileData.studentProfile.yearOfStudy || 1);
      setInterests(profileData.studentProfile.interests || "");
      setBio(profileData.studentProfile.bio || "");
    }
    setSaveError("");
    setSaveSuccess("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    if (!name.trim()) {
      setSaveError("Full Name is required.");
      return;
    }
    if (!university.trim()) {
      setSaveError("University / Law School is required.");
      return;
    }
    if (!course.trim()) {
      setSaveError("Degree / Course is required.");
      return;
    }

    setSaving(true);
    try {
      const response = await api.updateProfile({
        name: name.trim(),
        university: university.trim(),
        course: course.trim(),
        yearOfStudy: Number(yearOfStudy),
        interests: interests.trim(),
        bio: bio.trim(),
      });

      if (response && response.status === "success" && response.data.user) {
        setProfileData(response.data.user);
        setIsEditing(false);
        setSaveSuccess("Profile updated successfully.");
        setTimeout(() => setSaveSuccess(""), 4000);
      } else {
        setSaveError("Unable to save your profile. Please try again.");
      }
    } catch (err: unknown) {
      console.error("[Profile] Save error:", err);
      setSaveError("Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !profileData) {
    return (
      <div className="p-8 bg-[#FFFDF8] border border-rose-100 rounded-3xl text-center space-y-4 max-w-md mx-auto">
        <XCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider">
          Profile Load Failed
        </h3>
        <p className="text-xs text-[#766B5F] leading-relaxed">
          {error || "An unexpected error occurred while fetching user data."}
        </p>
      </div>
    );
  }

  const creationDate = new Date(profileData.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="My Profile"
          subtitle="Manage your ecosystem parameters, credentials, and legal qualifications."
        />

        {profileData.role === "STUDENT" && !isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-[0.98] self-start md:self-auto"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Inline Feedback Alerts */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2.5 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900 flex items-center gap-2.5 animate-fade-in">
          <XCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Summary Panel */}
        <div className="lg:col-span-1 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs text-center space-y-5">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-[#A66A22]/10 border-2 border-[#A66A22]/20 flex items-center justify-center overflow-hidden mx-auto">
              {profileData.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profileData.avatarUrl} alt={profileData.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-serif font-bold text-[#A66A22]">
                  {profileData.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#21170F]">
              {profileData.name}
            </h2>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#A66A22]/10 border border-[#A66A22]/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#A66A22]">
              {profileData.role === "STUDENT" && <GraduationCap className="w-3 h-3" />}
              {profileData.role === "LAWYER" && <ShieldCheck className="w-3 h-3" />}
              {profileData.role === "ADMIN" && <Shield className="w-3 h-3" />}
              <span>{profileData.role}</span>
            </span>
          </div>

          <div className="border-t border-[#E2D5C1]/40 pt-4 text-left space-y-3.5">
            {/* Email Field with explicit locked badge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-[#766B5F] font-semibold">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#766B5F]/70" />
                  <span className="truncate">{profileData.email}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#766B5F]/70 bg-[#E2D5C1]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Read-only</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[#766B5F] font-semibold">
              <Calendar className="w-4 h-4 text-[#766B5F]/70" />
              <span>Joined {creationDate}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[#766B5F] font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              <span className="text-emerald-800">Email Verified (Firebase)</span>
            </div>
          </div>
        </div>

        {/* Detailed Profile Specifications Panel */}
        <div className="lg:col-span-2 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-6">
          {/* VIEW MODE */}
          {!isEditing && profileData.role === "STUDENT" && profileData.studentProfile && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider mb-2">
                  Academic Outlines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#F8F4EC]/50 p-4 rounded-xl border border-[#E2D5C1]/30">
                    <span className="text-[10px] font-bold text-[#766B5F] uppercase tracking-wider block mb-1">
                      University / Law School
                    </span>
                    <span className="text-xs font-bold text-[#21170F]">
                      {profileData.studentProfile.university}
                    </span>
                  </div>
                  <div className="bg-[#F8F4EC]/50 p-4 rounded-xl border border-[#E2D5C1]/30">
                    <span className="text-[10px] font-bold text-[#766B5F] uppercase tracking-wider block mb-1">
                      Degree / Course
                    </span>
                    <span className="text-xs font-bold text-[#21170F]">
                      {profileData.studentProfile.course}
                    </span>
                  </div>
                  <div className="bg-[#F8F4EC]/50 p-4 rounded-xl border border-[#E2D5C1]/30">
                    <span className="text-[10px] font-bold text-[#766B5F] uppercase tracking-wider block mb-1">
                      Year of Study
                    </span>
                    <span className="text-xs font-bold text-[#21170F]">
                      Year {profileData.studentProfile.yearOfStudy}
                    </span>
                  </div>
                  <div className="bg-[#F8F4EC]/50 p-4 rounded-xl border border-[#E2D5C1]/30">
                    <span className="text-[10px] font-bold text-[#766B5F] uppercase tracking-wider block mb-1">
                      Special Interests
                    </span>
                    <span className="text-xs font-bold text-[#21170F]">
                      {profileData.studentProfile.interests || "Constitutional, Corporate Practice"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider mb-2">
                  Ecosystem Bio
                </h3>
                <p className="text-xs text-[#766B5F] leading-relaxed bg-[#F8F4EC]/30 p-4 rounded-xl border border-[#E2D5C1]/30 font-medium">
                  {profileData.studentProfile.bio || "No biography added yet. Click Edit Profile to personalize."}
                </p>
              </div>
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing && profileData.role === "STUDENT" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider mb-4 border-b border-[#E2D5C1]/40 pb-2">
                  Edit Academic Outlines & Details
                </h3>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="edit-name" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="block w-full h-[44px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-xs font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* University */}
                    <div className="space-y-1.5">
                      <label htmlFor="edit-uni" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                        University / Law School
                      </label>
                      <input
                        type="text"
                        id="edit-uni"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="National Law School"
                        required
                        className="block w-full h-[44px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-xs font-semibold"
                      />
                    </div>

                    {/* Degree / Course */}
                    <div className="space-y-1.5">
                      <label htmlFor="edit-course" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                        Degree / Course
                      </label>
                      <input
                        type="text"
                        id="edit-course"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="B.A.LL.B (Hons)"
                        required
                        className="block w-full h-[44px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-xs font-semibold"
                      />
                    </div>

                    {/* Year of Study */}
                    <div className="space-y-1.5">
                      <label htmlFor="edit-year" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                        Year of Study
                      </label>
                      <select
                        id="edit-year"
                        value={yearOfStudy}
                        onChange={(e) => setYearOfStudy(Number(e.target.value))}
                        className="block w-full h-[44px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-xs font-semibold"
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                        <option value={5}>5th Year</option>
                      </select>
                    </div>

                    {/* Special Interests */}
                    <div className="space-y-1.5">
                      <label htmlFor="edit-interests" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                        Special Interests
                      </label>
                      <input
                        type="text"
                        id="edit-interests"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="e.g. Constitutional Law, Cyber Law"
                        className="block w-full h-[44px] px-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Ecosystem Bio */}
                  <div className="space-y-1.5">
                    <label htmlFor="edit-bio" className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                      Ecosystem Bio
                    </label>
                    <textarea
                      id="edit-bio"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about your legal aspirations and practice interests..."
                      className="block w-full p-4 text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] text-xs font-medium resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2D5C1]/40">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#E2D5C1] text-[#766B5F] hover:text-[#21170F] bg-[#FFFDF8] hover:bg-[#F8F4EC] rounded-xl font-semibold text-xs transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-semibold text-xs transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {profileData.role === "LAWYER" && profileData.lawyerProfile && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider mb-2">
                  Advocate Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#F8F4EC]/50 p-4 rounded-xl border border-[#E2D5C1]/30">
                    <span className="text-[10px] font-bold text-[#766B5F] uppercase tracking-wider block mb-1">
                      Professional Title
                    </span>
                    <span className="text-xs font-bold text-[#21170F]">
                      {profileData.lawyerProfile.professionalTitle}
                    </span>
                  </div>
                  <div className="bg-[#F8F4EC]/50 p-4 rounded-xl border border-[#E2D5C1]/30">
                    <span className="text-[10px] font-bold text-[#766B5F] uppercase tracking-wider block mb-1">
                      State Bar Enrollment Number
                    </span>
                    <span className="text-xs font-bold text-[#21170F]">
                      {profileData.lawyerProfile.enrollmentNumber}
                    </span>
                  </div>
                  <div className="bg-[#F8F4EC]/50 p-4 rounded-xl border border-[#E2D5C1]/30">
                    <span className="text-[10px] font-bold text-[#766B5F] uppercase tracking-wider block mb-1">
                      Practice Specialization
                    </span>
                    <span className="text-xs font-bold text-[#21170F]">
                      {profileData.lawyerProfile.specialization}
                    </span>
                  </div>
                  <div className="bg-[#F8F4EC]/50 p-4 rounded-xl border border-[#E2D5C1]/30">
                    <span className="text-[10px] font-bold text-[#766B5F] uppercase tracking-wider block mb-1">
                      Experience Years
                    </span>
                    <span className="text-xs font-bold text-[#21170F]">
                      {profileData.lawyerProfile.experienceYears} Years
                    </span>
                  </div>
                  <div className="bg-[#F8F4EC]/50 p-4 rounded-xl border border-[#E2D5C1]/30 md:col-span-2">
                    <span className="text-[10px] font-bold text-[#766B5F] uppercase tracking-wider block mb-1">
                      Office / Practice Location
                    </span>
                    <span className="text-xs font-bold text-[#21170F]">
                      {profileData.lawyerProfile.location}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider mb-2">
                  Ecosystem Bio
                </h3>
                <p className="text-xs text-[#766B5F] leading-relaxed bg-[#F8F4EC]/30 p-4 rounded-xl border border-[#E2D5C1]/30 font-medium">
                  {profileData.lawyerProfile.bio || "No professional biography listed yet."}
                </p>
              </div>
            </div>
          )}

          {profileData.role === "ADMIN" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider mb-2">
                  Ecosystem Administration Settings
                </h3>
                <div className="p-4 bg-[#A66A22]/5 border border-[#A66A22]/20 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-[#A66A22] uppercase tracking-wider">
                    Full System Root Access
                  </p>
                  <p className="text-xs text-[#766B5F] leading-relaxed">
                    You have complete administrative privilege. You can inspect platform-wide students database, audit bar certificates, and track live database transactions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
