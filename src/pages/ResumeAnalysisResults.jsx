import "react-circular-progressbar/dist/styles.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  ArrowRight,
  User,
  GraduationCap,
  Briefcase,
  Settings,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { uploadResumeSuccess, resetResume } from "../redux/resumeSlice";
import ProgressBar from "../components/ProgressBar";
import ReportSection from "../components/ReportSection";
import ResumeUploadForm from "../components/ResumeUploadForm";

const ResumeAnalyzer = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [jobRole, setJobRole] = useState("");
  const [analyzeClicked, setAnalyzeClicked] = useState(false);
  const [scores, setScores] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [data, setData] = useState([]);
  const dispatch = useDispatch();
  const { uploaded, resumeResult, role, sectionScores } = useSelector(
    (state) => state.resume
  );

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeUploaded(true);
      setResume(file);
      setAnalyzeClicked(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resume) {
      toast.error("Please select a resume first!", {
        duration: 2000,
        position: "bottom-right",
      });
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error(`User not authenticated. Please log in.`, {
          duration: 2000,
          position: "bottom-right",
        });
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("jobDescription", jobRole);

      const response = await axios.post(API_URL + "/resume/analyse", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data.resume);
      const sectionScoresResponse = response.data.sectionScores;
      const newData = Object.keys(sectionScoresResponse).map((key) => ({
        section: key.charAt(0).toUpperCase() + key.slice(1),
        score: sectionScoresResponse[key],
      }));
      setData(newData);
      dispatch(
        uploadResumeSuccess({
          DummyRole: jobRole,
          DummyResult: response.data.resume,
          newData,
        })
      );
      toast.success(`${response.data.message}`, {
        duration: 2000,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast.error("Failed to analyze the resume", {
        duration: 2000,
        position: "bottom-right",
      });
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error, {
          duration: 3000,
          position: "bottom-right",
        });
      }
    } finally {
      setLoading(false);
    }

    const dummyResumeScore = {
      overall: 78.6,
      categories: [
        { label: "Skills", value: 85.2 },
        { label: "Experience", value: 65.7 },
        { label: "Education", value: 38.3 },
      ],
    };

    setTimeout(() => {
      setScores(dummyResumeScore);
      setAnalyzeClicked(true);
    }, 1000);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      setResumeUploaded(true);
      setResume(file);
      setAnalyzeClicked(false);
    }
  };

  const handleUploadNewResume = () => {
    setAnalyzeClicked(false);
  };

  return (
    // Apply flex-col and min-h-screen to root container with overflow-auto on mobile to enable scrolling
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col overflow-auto">
      {!uploaded ? (
        <ResumeUploadForm
          resume={resume}
          setResume={setResume}
          handleResumeUpload={handleResumeUpload}
          handleDragOver={handleDragOver}
          handleDragEnter={handleDragEnter}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          dragActive={dragActive}
          jobRole={jobRole}
          setJobRole={setJobRole}
          handleAnalyze={handleAnalyze}
          resumeUploaded={resumeUploaded}
          loading={loading}
        />
      ) : (
        // Layout container: flex-col on mobile, flex-row on md+
        <div className="flex flex-col md:flex-row h-full md:h-screen bg-gray-50 min-h-0">
          {/* Sidebar for Resume Analysis */}
          <aside
            className="
              w-full md:w-[375px]
              bg-[#256EFF15]
              rounded-[33px] border-2 border-gray-200 p-6
              flex flex-col flex-shrink-0
              h-auto md:h-full
              md:sticky md:top-0 md:self-start
            "
          >
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
              Resume Analysis
            </h2>

            <div className="flex flex-col items-center mb-4">
              <div className="relative w-36 h-36">
                <CircularProgressbar
                  value={resumeResult.analysis.score}
                  text=""
                  styles={buildStyles({
                    pathColor: "#2563EB",
                    trailColor: "#BFDBFE",
                    strokeLinecap: "round",
                  })}
                  strokeWidth={10}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {resumeResult.analysis.score}/100
                  </span>
                  <span className="text-[16px] font-semibold text-blue-600 mt-1">
                    {resumeResult.analysis.score >= 80
                      ? "Excellent"
                      : resumeResult.analysis.score >= 60
                      ? "Good"
                      : "Needs Improvement"}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-center w-32">
                <span className="text-lg font-bold text-black">ATS Score</span>
                <hr className="mt-1 border-gray-400" />
              </div>
            </div>

            <ProgressBar sectionScores={sectionScores} />
          </aside>

          {/* Scrollable Resume Report Main Content */}
          <main
            className="
              flex-1 overflow-y-auto p-6
              min-h-0
              // Add top margin on small screens to give space below sidebar vertically
              md:ml-0
            "
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <h1 className="font-semibold text-[30px] leading-[100%] tracking-[0%] w-full h-[36px] bg-gradient-to-r from-[#256EFF] to-[#164299] text-transparent bg-clip-text font-['Inter'] text-center mb-6">
              Resume Report
            </h1>
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Candidate Profile Section */}
              <ReportSection icon={<User size={25} />} title="Candidate Profile">
                <ul className="list-disc list-inside space-y-1 break-words">
                  {resumeResult.personalInfo?.name && (
                    <li>
                      <strong>Name:</strong> {resumeResult.personalInfo.name}
                    </li>
                  )}
                  {resumeResult.personalInfo?.email && (
                    <li>
                      <strong>Email:</strong> {resumeResult.personalInfo.email}
                    </li>
                  )}
                  {resumeResult.personalInfo?.phone && (
                    <li>
                      <strong>Phone:</strong> {resumeResult.personalInfo.phone}
                    </li>
                  )}
                  {resumeResult.personalInfo?.location && (
                    <li>
                      <strong>Location:</strong> {resumeResult.personalInfo.location}
                    </li>
                  )}
                </ul>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-4">
                  <p>
                    <strong>ATS Score:</strong> {resumeResult.analysis.score}/100
                  </p>
                  <p>
                    <strong>Readability:</strong> {resumeResult.analysis.readabilityScore}/100
                  </p>
                </div>
                <p className="text-md mt-3 text-gray-600 break-words">
                  {resumeResult.analysis.detailedDescription}
                </p>
              </ReportSection>

              {/* Education Section */}
              {resumeResult?.education?.length > 0 && (
                <ReportSection icon={<GraduationCap size={25} />} title="Education">
                  {resumeResult.education.map((edu, idx) => (
                    <div key={idx} className="space-y-1 break-words">
                      {edu.degree && (
                        <p>
                          <strong>{edu.degree}</strong>
                          {edu.branch && ` - ${edu.branch}`}
                        </p>
                      )}
                      {edu.university && <p>{edu.university}</p>}
                      {edu.year && <p>{edu.year}</p>}
                      {edu.cgpa && <p>CGPA: {edu.cgpa} / 10</p>}
                    </div>
                  ))}
                </ReportSection>
              )}

              {/* Experience Section */}
              {resumeResult?.experience?.length > 0 &&
                resumeResult.experience.filter(
                  (exp) => exp.role && exp.company && exp.description
                ).length > 0 && (
                  <ReportSection icon={<Briefcase size={25} />} title="Experience">
                    <p className="font-medium text-gray-600">
                      Industry / Internship exposure
                    </p>
                    {resumeResult.experience
                      .filter(
                        (exp) => exp.role && exp.company && exp.description
                      )
                      .map((exp, idx) => (
                        <div key={idx} className="space-y-1 break-words">
                          <p>
                            <strong>
                              {exp.role} at {exp.company}
                            </strong>
                          </p>
                          <p>{exp.description}</p>
                        </div>
                      ))}
                  </ReportSection>
                )}

              {/* Core Skills Section */}
              {resumeResult.skills &&
                Object.keys(resumeResult.skills).length > 0 && (
                  <ReportSection icon={<Settings size={25} />} title="Core Skills" className="shadow-md">
                    <div className="text-sm text-gray-700 space-y-4 break-words">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(resumeResult.skills).map(
                          ([category, skills], index) =>
                            skills && skills.length > 0 ? (
                              <div key={index}>
                                <p className="font-semibold mb-2 capitalize">
                                  {category.replace(/([A-Z])/g, " $1")}:
                                </p>
                                <p>{skills.join(", ")}</p>
                              </div>
                            ) : null
                        )}
                      </div>
                    </div>
                  </ReportSection>
                )}

              {/* Missing Keywords Section */}
              <ReportSection icon={<AlertCircle size={25} />} title="Missing Keywords" className="shadow-md break-words">
                <p className="text-sm text-gray-600 mb-4">
                  To enhance your resume visibility
                </p>
                <div className="flex flex-wrap gap-2">
                  {resumeResult.analysis.missingKeywords?.length > 0 ? (
                    resumeResult.analysis.missingKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-red-100 text-red-600 border border-red-300 rounded-full text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No missing keywords detected.
                    </p>
                  )}
                </div>
              </ReportSection>

              {/* Suggested Career Roles Section */}
              <ReportSection icon={<Briefcase size={25} />} title="Suggested Career Roles" className="shadow-md break-words">
                <p className="text-md text-gray-600 mb-4">
                  Matching your resume content
                </p>
                <div className="text-md text-gray-700">
                  {resumeResult.analysis.suggestedJobs?.length > 0 ? (
                    <ul className="space-y-2">
                      {resumeResult.analysis.suggestedJobs.map((job, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          {job}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      No suggested career roles available at this time.
                    </p>
                  )}
                </div>
              </ReportSection>
            </div>

            {/* Upload New Resume Button */}
            <div className="max-w-4xl mx-auto mt-8">
              <button
                onClick={() => dispatch(resetResume())}
                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                Upload New Resume
              </button>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;

