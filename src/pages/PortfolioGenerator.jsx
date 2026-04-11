import { useState } from "react";
import {
  Download, Eye, Sparkles, Plus,
  Trash2, ExternalLink, User,
  Code2, Briefcase, Globe, Link,
  Mail, Phone
} from "lucide-react";
import { useToast } from "../context/ToastContext";

const DEFAULT_FORM = {
  name:     "Arjun Kumar",
  title:    "Frontend Developer",
  email:    "arjun@email.com",
  phone:    "+91 98765 43210",
  github:   "github.com/arjunkumar",
  linkedin: "linkedin.com/in/arjunkumar",
  website:  "",
  about:    "Passionate frontend developer and final year B.Tech CSE student. I love building beautiful, performant web applications using React.js and modern JavaScript.",
  skills:   ["React.js", "JavaScript", "Tailwind CSS", "Python", "SQL", "Git"],
  projects: [
    {
      name:   "CodeSphere AI",
      desc:   "AI-powered developer productivity platform with 7 modules including DSA visualizer, SQL playground, OS simulator, and AI code reviewer.",
      tech:   "React.js, Python Flask, Gemini AI, Chart.js",
      link:   "https://codesphere-ai.vercel.app",
      github: "https://github.com/arjunkumar/codesphere-ai",
    },
  ],
  education: {
    degree:  "B.Tech Computer Science Engineering",
    college: "Visvesvaraya Technological University",
    year:    "2025",
    gpa:     "8.7",
  },
  experience: "",
};

const THEMES = [
  { id: "blue",   label: "Ocean",  primary: "#3b82f6", bg: "#0f172a", text: "#f1f5f9" },
  { id: "purple", label: "Galaxy", primary: "#a78bfa", bg: "#0f0a1e", text: "#f1f5f9" },
  { id: "green",  label: "Forest", primary: "#22c55e", bg: "#0a1a0f", text: "#f1f5f9" },
  { id: "orange", label: "Sunset", primary: "#f97316", bg: "#1a0f0a", text: "#f1f5f9" },
  { id: "rose",   label: "Rose",   primary: "#f43f5e", bg: "#1a0a0f", text: "#f1f5f9" },
  { id: "light",  label: "Clean",  primary: "#3b82f6", bg: "#ffffff", text: "#0f172a" },
];

function generateHTML(form, theme) {
  const projectsHTML = form.projects.map(function(p) {
    return (
      "<div style='background:" + theme.bg + ";border:1px solid " + theme.primary + "33;border-radius:12px;padding:20px;'>" +
        "<h3 style='color:" + theme.primary + ";margin:0 0 8px;font-size:16px;'>" + p.name + "</h3>" +
        "<p style='color:" + theme.text + ";opacity:0.8;font-size:14px;margin:0 0 10px;line-height:1.6;'>" + p.desc + "</p>" +
        "<p style='color:" + theme.primary + ";font-size:12px;margin:0 0 12px;opacity:0.8;'>" + p.tech + "</p>" +
        "<div style='display:flex;gap:10px;'>" +
          (p.link   ? "<a href='" + p.link   + "' target='_blank' style='color:" + theme.primary + ";font-size:13px;'>Live Demo →</a>" : "") +
          (p.github ? "<a href='" + p.github + "' target='_blank' style='color:" + theme.primary + ";font-size:13px;opacity:0.7;'>GitHub →</a>" : "") +
        "</div>" +
      "</div>"
    );
  }).join("");

  const skillsHTML = form.skills.map(function(s) {
    return "<span style='background:" + theme.primary + "22;color:" + theme.primary + ";padding:6px 14px;border-radius:20px;font-size:13px;border:1px solid " + theme.primary + "44;'>" + s + "</span>";
  }).join("");

  return "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>" + form.name + " — Portfolio</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Segoe UI',system-ui,sans-serif;background:" + theme.bg + ";color:" + theme.text + ";line-height:1.6;}a{color:" + theme.primary + ";text-decoration:none;}a:hover{text-decoration:underline;}.container{max-width:900px;margin:0 auto;padding:40px 20px;}.hero{text-align:center;padding:60px 0 40px;border-bottom:1px solid " + theme.primary + "22;margin-bottom:40px;}.hero h1{font-size:42px;font-weight:700;color:" + theme.primary + ";margin-bottom:8px;}.hero h2{font-size:18px;opacity:0.7;font-weight:400;margin-bottom:20px;}.hero p{font-size:15px;opacity:0.75;max-width:600px;margin:0 auto 24px;}.links{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;}.link-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border:1px solid " + theme.primary + ";border-radius:8px;color:" + theme.primary + ";font-size:13px;transition:all 0.2s;}.link-btn:hover{background:" + theme.primary + ";color:" + theme.bg + ";text-decoration:none;}section{margin-bottom:48px;}h2.section-title{font-size:22px;color:" + theme.primary + ";margin-bottom:20px;padding-bottom:8px;border-bottom:1px solid " + theme.primary + "33;}.skills{display:flex;flex-wrap:wrap;gap:10px;}.projects{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;}.edu-card{background:" + theme.bg + ";border:1px solid " + theme.primary + "33;border-radius:12px;padding:20px;}.edu-card h3{color:" + theme.primary + ";margin-bottom:6px;}.footer{text-align:center;padding:30px;opacity:0.4;font-size:13px;border-top:1px solid " + theme.primary + "22;margin-top:20px;}</style></head><body><div class='container'><div class='hero'><h1>" + form.name + "</h1><h2>" + form.title + "</h2><p>" + form.about + "</p><div class='links'>" +
    (form.email    ? "<a class='link-btn' href='mailto:" + form.email + "'>✉ Email</a>" : "") +
    (form.github   ? "<a class='link-btn' href='https://" + form.github + "' target='_blank'>⌥ GitHub</a>" : "") +
    (form.linkedin ? "<a class='link-btn' href='https://" + form.linkedin + "' target='_blank'>in LinkedIn</a>" : "") +
    (form.website  ? "<a class='link-btn' href='https://" + form.website + "' target='_blank'>⊕ Website</a>" : "") +
    "</div></div>" +
    "<section><h2 class='section-title'>Skills</h2><div class='skills'>" + skillsHTML + "</div></section>" +
    "<section><h2 class='section-title'>Projects</h2><div class='projects'>" + projectsHTML + "</div></section>" +
    "<section><h2 class='section-title'>Education</h2><div class='edu-card'><h3>" + form.education.degree + "</h3><p style='opacity:0.8;margin:4px 0;'>" + form.education.college + "</p><p style='opacity:0.6;font-size:14px;'>Graduating " + form.education.year + " · CGPA: " + form.education.gpa + "</p></div></section>" +
    (form.experience ? "<section><h2 class='section-title'>Experience</h2><div class='edu-card'><p style='opacity:0.8;'>" + form.experience + "</p></div></section>" : "") +
    "<div class='footer'>Built with CodeSphere AI Portfolio Generator</div></div></body></html>";
}

export default function PortfolioGenerator() {
  const toast = useToast();

  const [form, setForm]           = useState(DEFAULT_FORM);
  const [activeTab, setActiveTab] = useState("basic");
  const [preview, setPreview]     = useState(false);
  const [theme, setTheme]         = useState(THEMES[0]);
  const [newSkill, setNewSkill]   = useState("");

  function updateForm(key, value) {
    setForm(function(prev) { return { ...prev, [key]: value }; });
  }

  function updateProject(index, key, value) {
    setForm(function(prev) {
      const projects = [...prev.projects];
      projects[index] = { ...projects[index], [key]: value };
      return { ...prev, projects };
    });
  }

  function addProject() {
    setForm(function(prev) {
      return { ...prev, projects: [...prev.projects, { name: "", desc: "", tech: "", link: "", github: "" }] };
    });
    toast.success("New project added!", { title: "Project Added" });
  }

  function removeProject(index) {
    setForm(function(prev) {
      return { ...prev, projects: prev.projects.filter(function(_, i) { return i !== index; }) };
    });
    toast.info("Project removed", { title: "Removed" });
  }

  function addSkill() {
    if (!newSkill.trim()) return;
    setForm(function(prev) { return { ...prev, skills: [...prev.skills, newSkill.trim()] }; });
    toast.success(newSkill + " added to skills!", { title: "Skill Added" });
    setNewSkill("");
  }

  function removeSkill(index) {
    setForm(function(prev) {
      return { ...prev, skills: prev.skills.filter(function(_, i) { return i !== index; }) };
    });
  }

  function downloadPortfolio() {
    const html = generateHTML(form, theme);
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = form.name.replace(/\s+/g, "-").toLowerCase() + "-portfolio.html";
    a.click();
    URL.revokeObjectURL(url);
    // ✅ Toast added here — after file downloads
    toast.success("Portfolio downloaded! Open the HTML file in any browser.", { title: "Download Complete ✓" });
  }

  function togglePreview() {
    setPreview(function(p) { return !p; });
    if (!preview) toast.info("Preview mode — see how your portfolio looks!", { title: "Preview" });
  }

  const TABS = [
    { id: "basic",     label: "Basic Info",  icon: User      },
    { id: "skills",    label: "Skills",      icon: Code2     },
    { id: "projects",  label: "Projects",    icon: Briefcase },
    { id: "education", label: "Education",   icon: Globe     },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Portfolio Generator</h1>
          <p className="text-sm text-slate-400 mt-1">Fill the form — download a beautiful HTML portfolio instantly</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={togglePreview}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-all"
          >
            <Eye size={14} />
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={downloadPortfolio}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-medium transition-all"
          >
            <Download size={14} />
            Download HTML
          </button>
        </div>
      </div>

      {!preview ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-4">

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
              {TABS.map(function(tab) {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={function() { setActiveTab(tab.id); }}
                    className={"flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all " +
                      (activeTab === tab.id ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-300")}
                  >
                    <Icon size={13} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Basic Info */}
            {activeTab === "basic" && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Full Name",    key: "name",     placeholder: "Arjun Kumar",            span: 1 },
                    { label: "Job Title",    key: "title",    placeholder: "Frontend Developer",      span: 1 },
                    { label: "Email",        key: "email",    placeholder: "arjun@email.com",         span: 1 },
                    { label: "Phone",        key: "phone",    placeholder: "+91 98765 43210",          span: 1 },
                    { label: "GitHub URL",   key: "github",   placeholder: "github.com/username",     span: 1 },
                    { label: "LinkedIn URL", key: "linkedin", placeholder: "linkedin.com/in/username", span: 1 },
                    { label: "Website",      key: "website",  placeholder: "yourwebsite.com",         span: 2 },
                  ].map(function(field) {
                    return (
                      <div key={field.key} className={field.span === 2 ? "col-span-2" : ""}>
                        <label className="text-xs text-slate-400 block mb-1.5">{field.label}</label>
                        <input
                          type="text"
                          value={form[field.key]}
                          onChange={function(e) { updateForm(field.key, e.target.value); }}
                          placeholder={field.placeholder}
                          className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-all"
                        />
                      </div>
                    );
                  })}
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">About Me</label>
                  <textarea
                    value={form.about}
                    onChange={function(e) { updateForm("about", e.target.value); }}
                    rows={4}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none transition-all"
                    placeholder="Write a short bio..."
                  />
                </div>
              </div>
            )}

            {/* Skills */}
            {activeTab === "skills" && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={function(e) { setNewSkill(e.target.value); }}
                    onKeyDown={function(e) { if (e.key === "Enter") addSkill(); }}
                    placeholder="Add a skill (e.g. React.js)"
                    className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-all"
                  />
                  <button
                    onClick={addSkill}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white transition-all"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.skills.map(function(skill, i) {
                    return (
                      <div key={i} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
                        <span className="text-sm text-slate-300">{skill}</span>
                        <button onClick={function() { removeSkill(i); }} className="text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Projects */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                {form.projects.map(function(project, index) {
                  return (
                    <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Project {index + 1}</h3>
                        <button onClick={function() { removeProject(index); }} className="text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Project Name", key: "name",   placeholder: "CodeSphere AI",          span: 2 },
                          { label: "Tech Stack",   key: "tech",   placeholder: "React, Node.js, MongoDB", span: 2 },
                          { label: "Live Link",    key: "link",   placeholder: "https://...",             span: 1 },
                          { label: "GitHub Link",  key: "github", placeholder: "https://github.com/...",  span: 1 },
                        ].map(function(field) {
                          return (
                            <div key={field.key} className={field.span === 2 ? "col-span-2" : ""}>
                              <label className="text-xs text-slate-400 block mb-1">{field.label}</label>
                              <input
                                type="text"
                                value={project[field.key]}
                                onChange={function(e) { updateProject(index, field.key, e.target.value); }}
                                placeholder={field.placeholder}
                                className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition-all"
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Description</label>
                        <textarea
                          value={project.desc}
                          onChange={function(e) { updateProject(index, "desc", e.target.value); }}
                          rows={2}
                          placeholder="Describe what this project does..."
                          className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white outline-none resize-none transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={addProject}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-sm text-slate-400 hover:text-blue-400 transition-all"
                >
                  <Plus size={15} /> Add Project
                </button>
              </div>
            )}

            {/* Education */}
            {activeTab === "education" && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                {[
                  { label: "Degree",   key: "degree",  placeholder: "B.Tech Computer Science" },
                  { label: "College",  key: "college", placeholder: "VTU, Belagavi"            },
                  { label: "Year",     key: "year",    placeholder: "2025"                     },
                  { label: "GPA/CGPA", key: "gpa",     placeholder: "8.7"                      },
                ].map(function(field) {
                  return (
                    <div key={field.key}>
                      <label className="text-xs text-slate-400 block mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        value={form.education[field.key]}
                        onChange={function(e) {
                          setForm(function(prev) {
                            return { ...prev, education: { ...prev.education, [field.key]: e.target.value } };
                          });
                        }}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-all"
                      />
                    </div>
                  );
                })}
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Work Experience (optional)</label>
                  <textarea
                    value={form.experience}
                    onChange={function(e) { updateForm("experience", e.target.value); }}
                    rows={3}
                    placeholder="Internship / part-time experience..."
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right — Theme + Preview */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                Color Theme
              </h3>
              <div className="space-y-2">
                {THEMES.map(function(t) {
                  return (
                    <button
                      key={t.id}
                      onClick={function() {
                        setTheme(t);
                        toast.info(t.label + " theme applied!", { title: "Theme Changed" });
                      }}
                      className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all " +
                        (theme.id === t.id ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-600")}
                    >
                      <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: t.primary }} />
                      <span className="text-sm text-slate-300">{t.label}</span>
                      <div className="ml-auto w-10 h-5 rounded" style={{ backgroundColor: t.bg, border: "1px solid #334155" }} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Preview</h3>
              <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: theme.bg, color: theme.text }}>
                <div className="text-lg font-bold" style={{ color: theme.primary }}>{form.name || "Your Name"}</div>
                <div className="text-xs opacity-70">{form.title || "Your Title"}</div>
                <div className="text-xs opacity-60 leading-relaxed line-clamp-3">{form.about || "Your bio..."}</div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {form.skills.slice(0, 4).map(function(s, i) {
                    return (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.primary + "33", color: theme.primary }}>
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">What You Get</h3>
              <ul className="space-y-2 text-xs text-slate-400">
                {["Single HTML file — host anywhere", "Beautiful responsive design", "All your info pre-filled", "Custom color theme applied", "Deploy free on GitHub Pages"].map(function(item, i) {
                  return (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      {item}
                    </li>
                  );
                })}
              </ul>
              <button
                onClick={downloadPortfolio}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm text-white font-medium transition-all"
              >
                <Download size={14} /> Download Portfolio
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-slate-400 mx-auto">{form.name} — Portfolio Preview</span>
          </div>
          <iframe
            srcDoc={generateHTML(form, theme)}
            className="w-full"
            style={{ height: "700px", border: "none" }}
            title="Portfolio Preview"
          />
        </div>
      )}
    </div>
  );
}