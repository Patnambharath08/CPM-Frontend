import { useEffect, useState } from "react";

const API = "http://localhost:8080/api";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState(null);
    const [page, setPage] = useState("dashboard");
    const [jobs, setJobs] = useState([]);
    const [students, setStudents] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [applications, setApplications] = useState([]);
    const [showRegister, setShowRegister] = useState(false);
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const [jobForm, setJobForm] = useState({
        companyName: "",
        jobTitle: "",
        description: "",
        location: "",
        salary: "",
        eligibility: "",
        applicationDeadline: "",
    });

    const isAdmin = user?.role === "ADMIN";

    const loadJobs = async () => {
        setLoadingJobs(true);
        setError("");

        try {
            const response = await fetch(`${API}/jobs`);

            if (!response.ok) {
                throw new Error("Could not load jobs.");
            }

            const data = await response.json();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Backend connection failed.");
        } finally {
            setLoadingJobs(false);
        }
    };

    useEffect(() => {
        if (user && (page === "jobs" || page === "manageJobs")) {
            loadJobs();
        }
    }, [user, page]);

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            setUser(data);
            setPage("dashboard");
            setPassword("");
        } catch (err) {
            setError(err.message || "Unable to log in.");
        }
    };

    const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: registerName,
                email: registerEmail,
                password: registerPassword,
                role: "STUDENT"
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                typeof data === "string"
                    ? data
                    : data.message || "Registration failed."
            );
        }

        setMessage("Registration successful! Please log in.");
        setShowRegister(false);
        setRegisterName("");
        setRegisterEmail("");
        setRegisterPassword("");

    } catch (error) {
        setError(error.message || "Backend connection failed.");
    }
};

    const handleLogout = () => {
        setUser(null);
        setEmail("");
        setPassword("");
        setPage("dashboard");
        setMessage("");
        setError("");
    };

    const handleJobInput = (event) => {
        const { name, value } = event.target;

        setJobForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const addJob = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${API}/jobs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jobForm),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Could not add job.");
            }

            setMessage("Job added successfully!");

            setJobForm({
                companyName: "",
                jobTitle: "",
                description: "",
                location: "",
                salary: "",
                eligibility: "",
                applicationDeadline: "",
            });

            await loadJobs();
            setPage("manageJobs");
        } catch (err) {
            setError(err.message || "Could not add job.");
        }
    };

    const loadStudents = async () => {
        setError("");

        try {
            const response = await fetch(`${API}/students`);

            if (!response.ok) {
                throw new Error("Could not load students.");
            }

            const data = await response.json();
            setStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Could not load students.");
        }
    };

    const openStudents = async () => {
        setPage("manageStudents");
        await loadStudents();
    };

    const goTo = (nextPage) => {
        setMessage("");
        setError("");
        setPage(nextPage);
    };

    const backButton = (
        <button
            className="button secondary"
            onClick={() => goTo("dashboard")}
        >
            Back to Dashboard
        </button>
    );
    useEffect(() => {
    if (!user?.email) return;

    fetch(
        `http://localhost:8080/api/applications?email=${encodeURIComponent(user.email)}`
    )
        .then((response) => {
        if (!response.ok) {
            throw new Error("Failed to load applications");
        }

        return response.json();
        })
        .then((data) => {
        setApplications(data);
        })
        .catch((error) => {
        console.error("Applications error:", error);
        });
    }, [user?.email]);

    return (
        <div className="app">
            <style>{`
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Arial, Helvetica, sans-serif;
                }

                .app {
                    min-height: 100vh;
                    padding: 32px 18px 50px;
                    color: white;
                    background: linear-gradient(
                        135deg,
                        #071a45,
                        #123e8a,
                        #0b1c4b
                    );
                }

                .heading {
                    text-align: center;
                    font-size: clamp(26px, 4vw, 42px);
                    margin: 10px auto 30px;
                    line-height: 1.2;
                }

                .card {
                    width: 100%;
                    max-width: 760px;
                    margin: 0 auto 22px;
                    padding: 26px;
                    background: rgba(115, 151, 211, 0.42);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 14px;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.16);
                }

                .login-card {
                    max-width: 440px;
                }

                h2, h3 {
                    text-align: center;
                    margin-top: 0;
                }

                p {
                    line-height: 1.55;
                }

                .input {
                    display: block;
                    width: 100%;
                    padding: 12px 13px;
                    margin: 12px 0;
                    border: 1px solid #a8bad9;
                    border-radius: 7px;
                    background: #f8fbff;
                    color: #172033;
                    font-size: 15px;
                }

                .button {
                    display: block;
                    width: 100%;
                    padding: 12px 16px;
                    margin: 10px 0;
                    border: 0;
                    border-radius: 7px;
                    background: #06a9ed;
                    color: white;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                }

                .button:hover {
                    filter: brightness(1.08);
                }

                .button:disabled {
                    opacity: 0.65;
                    cursor: wait;
                }

                .button.secondary {
                    background: #2563eb;
                }

                .button.logout {
                    background: #e11d48;
                }

                .menu {
                    display: grid;
                    gap: 5px;
                    margin-top: 22px;
                }

                .job {
                    padding: 18px;
                    margin: 16px 0;
                    border-radius: 10px;
                    background: rgba(5, 20, 61, 0.8);
                    overflow-wrap: anywhere;
                }

                .job h3 {
                    text-align: left;
                    margin-bottom: 12px;
                }

                .job p {
                    margin: 7px 0;
                }

                .notice {
                    padding: 11px 13px;
                    margin: 12px auto;
                    border-radius: 7px;
                    background: rgba(6, 30, 74, 0.55);
                    overflow-wrap: anywhere;
                }

                .notice.error {
                    background: #7f1d1d;
                }

                .notice.success {
                    background: #14532d;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0 14px;
                }

                .form-grid .full {
                    grid-column: 1 / -1;
                }

                .student-row {
                    padding: 12px;
                    margin: 10px 0;
                    background: rgba(5, 20, 61, 0.65);
                    border-radius: 7px;
                    overflow-wrap: anywhere;
                }

                @media (max-width: 600px) {
                    .app {
                        padding: 22px 12px 35px;
                    }

                    .card {
                        padding: 18px;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-grid .full {
                        grid-column: auto;
                    }
                }
            `}</style>

            <h1 className="heading">
                College Placement Management System
            </h1>

            {error && (
                <div className="card notice error">
                    {error}
                </div>
            )}

            {message && (
                <div className="card notice success">
                    {message}
                </div>
            )}

            {!user ? (
                <div>
                    {!showRegister ? (
                    <div className="card login-card">
                        <h2>Login</h2>

                        <form onSubmit={handleLogin}>
                        <input
                            className="input"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />

                        <input
                            className="input"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />

                        <button className="button" type="submit">
                            Login
                        </button>
                        </form>

                        <p style={{ textAlign: "center", fontSize: 13 }}>
                        Sign in using an account registered in your database.
                        </p>

                        <p>
                        New student?{" "}
                        <button
                            type="button"
                            onClick={() => {
                            setShowRegister(true);
                            setError("");
                            setMessage("");
                            }}
                        >
                            Register here
                        </button>
                        </p>
                    </div>
                    ) : (
                    <div className="card login-card">
                        <h2>Student Registration</h2>

                        <form onSubmit={handleRegister}>
                        <input
                            className="input"
                            type="text"
                            placeholder="Full Name"
                            value={registerName}
                            onChange={(event) => setRegisterName(event.target.value)}
                            required
                        />

                        <input
                            className="input"
                            type="email"
                            placeholder="Email"
                            value={registerEmail}
                            onChange={(event) => setRegisterEmail(event.target.value)}
                            required
                        />

                        <input
                            className="input"
                            type="password"
                            placeholder="Password"
                            value={registerPassword}
                            onChange={(event) => setRegisterPassword(event.target.value)}
                            required
                        />

                        <button className="button" type="submit">
                            Register
                        </button>
                        </form>

                        <p>
                        Already registered?{" "}
                        <button
                            type="button"
                            onClick={() => setShowRegister(false)}
                        >
                            Login here
                        </button>
                        </p>
                    </div>
                    )}
                </div>
                ) : (
                <div className="card">
                    <h2>Welcome, {user.name || user.email || "User"}!</h2>

                    {page === "dashboard" && (
                        <>
                            <h3>
                                {isAdmin
                                    ? "Admin Dashboard"
                                    : "Student Dashboard"}
                            </h3>

                            {isAdmin ? (
                                <div className="menu">
                                    <button
                                        className="button"
                                        onClick={() => goTo("addJob")}
                                    >
                                        Add Job
                                    </button>

                                    <button
                                        className="button"
                                        onClick={() => goTo("manageJobs")}
                                    >
                                        Manage Jobs
                                    </button>

                                    <button
                                        className="button"
                                        onClick={openStudents}
                                    >
                                        Manage Students
                                    </button>

                                    <button
                                        className="button logout"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="menu">
                                    <button
                                        className="button"
                                        onClick={() => goTo("profile")}
                                    >
                                        My Profile
                                    </button>

                                    <button
                                        className="button"
                                        onClick={() => goTo("jobs")}
                                    >
                                        Available Jobs
                                    </button>

                                    <button
                                        className="button"
                                        onClick={() => goTo("applications")}
                                    >
                                        Applied Jobs
                                    </button>

                                    <button
                                        className="button"
                                        onClick={() => goTo("drives")}
                                    >
                                        Placement Drives
                                    </button>

                                    <button
                                        className="button"
                                        onClick={() => goTo("resume")}
                                    >
                                        My Resume
                                    </button>

                                    <button
                                        className="button logout"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {page === "profile" && (
                        <>
                            <h3>My Profile</h3>

                            <p>
                                <strong>Name:</strong>{" "}
                                {user.name || "Not provided"}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {user.email || "Not provided"}
                            </p>

                            <p>
                                <strong>Role:</strong>{" "}
                                {user.role || "STUDENT"}
                            </p>

                            {backButton}
                        </>
                    )}

                    {page === "jobs" && (
                        <>
                            <h3>Available Jobs</h3>

                            <button
                                className="button"
                                onClick={loadJobs}
                                disabled={loadingJobs}
                            >
                                {loadingJobs ? "Loading..." : "Refresh Jobs"}
                            </button>

                            {loadingJobs ? (
                                <p>Loading jobs...</p>
                            ) : jobs.length === 0 ? (
                                <p>
                                    No jobs found. An administrator can add
                                    jobs from the admin dashboard.
                                </p>
                            ) : (
                                jobs.map((job) => (
                                    <div
                                        className="job"
                                        key={
                                            job.id ??
                                            `${job.companyName}-${job.jobTitle}`
                                        }
                                    >
                                        <h3>{job.jobTitle}</h3>

                                        <p>
                                            <strong>Company:</strong>{" "}
                                            {job.companyName}
                                        </p>

                                        <p>
                                            <strong>Description:</strong>{" "}
                                            {job.description}
                                        </p>

                                        <p>
                                            <strong>Location:</strong>{" "}
                                            {job.location}
                                        </p>

                                        <p>
                                            <strong>Salary:</strong>{" "}
                                            {job.salary}
                                        </p>

                                        <p>
                                            <strong>Eligibility:</strong>{" "}
                                            {job.eligibility}
                                        </p>

                                        <p>
                                            <strong>Application Deadline:</strong>{" "}
                                            {job.applicationDeadline}
                                        </p>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(`${API}/applications`, {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json"
                                                        },
                                                        body: JSON.stringify({
                                                            studentEmail: user.email,
                                                            jobId: job.id
                                                        })
                                                    });

                                                    const data = await response.json();

                                                    if (!response.ok) {
                                                        alert(data.message || "Application failed");
                                                        return;
                                                    }

                                                    alert("Application submitted successfully!");
                                                    setApplications(prev => [...prev, data]);

                                                } catch (error) {
                                                    console.error("Application error:", error);
                                                    alert("Backend connection failed");
                                                }
                                            }}
                                        >
                                        Apply Now
                                        </button>
                                    </div>
                                ))
                            )}

                            {backButton}
                        </>
                    )}

                    {page === "applications" && (
                        <>
                            <h3>Applied Jobs</h3>

                           {applications.length === 0 ? (
                                <p>You have not applied for any jobs yet.</p>
                                ) : (
                                applications.map((application) => (
                                    <div className="job" key={application.id}>
                                    <h3>Application Details</h3>

                                    <p>
                                        <strong>Job ID:</strong> {application.jobId}
                                    </p>

                                    <p>
                                        <strong>Student Email:</strong> {application.studentEmail}
                                    </p>

                                    <p>
                                        <strong>Applied On:</strong> {application.appliedAt}
                                    </p>
                                    </div>
                                ))
                                )}

                            {backButton}
                        </>
                    )}

                    {page === "drives" && (
                        <>
                            <h3>Placement Drives</h3>

                            <p>
                                Upcoming placement drives will appear here
                                when a drives API is added to the backend.
                            </p>

                            {backButton}
                        </>
                    )}

                    {page === "resume" && (
                        <>
                            <h3>My Resume</h3>

                            <p>
                                Select a PDF or Word document. Resume storage
                                is not connected to the backend yet.
                            </p>

                            <input
                                className="input"
                                type="file"
                                accept=".pdf,.doc,.docx"
                            />

                            {backButton}
                        </>
                    )}

                    {page === "addJob" && isAdmin && (
                        <>
                            <h3>Add Job</h3>

                            <form onSubmit={addJob}>
                                <div className="form-grid">
                                    <input
                                        className="input"
                                        name="companyName"
                                        placeholder="Company Name"
                                        value={jobForm.companyName}
                                        onChange={handleJobInput}
                                        required
                                    />

                                    <input
                                        className="input"
                                        name="jobTitle"
                                        placeholder="Job Title"
                                        value={jobForm.jobTitle}
                                        onChange={handleJobInput}
                                        required
                                    />

                                    <input
                                        className="input"
                                        name="location"
                                        placeholder="Location"
                                        value={jobForm.location}
                                        onChange={handleJobInput}
                                        required
                                    />

                                    <input
                                        className="input"
                                        name="salary"
                                        placeholder="Salary (e.g. 6 LPA)"
                                        value={jobForm.salary}
                                        onChange={handleJobInput}
                                        required
                                    />

                                    <input
                                        className="input"
                                        name="eligibility"
                                        placeholder="Eligibility (e.g. BTech)"
                                        value={jobForm.eligibility}
                                        onChange={handleJobInput}
                                        required
                                    />

                                    <input
                                        className="input"
                                        name="applicationDeadline"
                                        type="date"
                                        value={jobForm.applicationDeadline}
                                        onChange={handleJobInput}
                                        required
                                    />

                                    <textarea
                                        className="input full"
                                        name="description"
                                        placeholder="Job Description"
                                        value={jobForm.description}
                                        onChange={handleJobInput}
                                        rows="3"
                                        required
                                    />
                                </div>

                                <button className="button" type="submit">
                                    Save Job
                                </button>
                            </form>

                            {backButton}
                        </>
                    )}

                    {page === "manageJobs" && isAdmin && (
                        <>
                            <h3>Manage Jobs</h3>

                            <button
                                className="button"
                                onClick={loadJobs}
                                disabled={loadingJobs}
                            >
                                {loadingJobs ? "Loading..." : "Refresh Jobs"}
                            </button>

                            {jobs.length === 0 ? (
                                <p>
                                    No jobs found. Use Add Job to create the
                                    first listing.
                                </p>
                            ) : (
                                jobs.map((job) => (
                                    <div
                                        className="job"
                                        key={
                                        job.id ??
                                        `${job.companyName}-${job.jobTitle}`
                                        }
                                    >
                                        <h3>{job.jobTitle}</h3>

                                        <p>
                                        <strong>Company:</strong>{" "}
                                        {job.companyName}
                                        </p>

                                        <p>
                                        <strong>Location:</strong>{" "}
                                        {job.location}
                                        </p>

                                        <p>
                                        <strong>Salary:</strong>{" "}
                                        {job.salary}
                                        </p>

                                        <p>
                                        <strong>Deadline:</strong>{" "}
                                        {job.applicationDeadline}
                                        </p>
                                    </div>
                                ))
                            )}

                            <button
                                className="button"
                                onClick={() => goTo("addJob")}
                            >
                                Add Another Job
                            </button>

                            {backButton}
                        </>
                    )}

                    {page === "manageStudents" && isAdmin && (
                        <>
                            <h3>Manage Students</h3>

                            {students.length === 0 ? (
                                <p>
                                    No students to display, or the backend
                                    returned an empty list.
                                </p>
                            ) : (
                                students.map((student) => (
                                    <div
                                        className="student-row"
                                        key={student.id ?? student.email}
                                    >
                                        <p>
                                            <strong>Name:</strong>{" "}
                                            {student.name}
                                        </p>

                                        <p>
                                            <strong>Email:</strong>{" "}
                                            {student.email}
                                        </p>

                                        <p>
                                            <strong>Role:</strong>{" "}
                                            {student.role}
                                        </p>
                                    </div>
                                ))
                            )}

                            <button
                                className="button"
                                onClick={loadStudents}
                            >
                                Refresh Students
                            </button>

                            {backButton}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;