import React, { useRef, useEffect, useState } from "react";
import { fetchGithubProfile, GITUHB_API_BASE_URL } from "../api";

const GithubProfileCanvas = () => {
    const canvasRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [activities, setActivities] = useState([]);
    const [username, setUsername] = useState("");
    const [selectedColor, setSelectedColor] = useState("#FFC0CB");

    const generateProfile = async () => {
        try {
            const userProfile = await fetchGithubProfile(username);
            setProfile(userProfile);
        } catch (error) {
            console.error("User not found")
        }
    }

    useEffect(() => {
        if (profile) {
            const fetchGithubActivites = async () => {
                try {
                    const response = await fetch(`${GITUHB_API_BASE_URL}/users/${profile.login}/events/public`)
                    const data = await response.json();
                    const filteredActivites = data.slice(0, 20);
                    setActivities(filteredActivites);
                } catch (error) {
                    console.error("Error fetching Github Activites", error)
                }
            };

            fetchGithubActivites();
        }
    }, [profile]);

    useEffect(() => {
        // เริ่มการทำงานของ useEffect เมื่อ profile ถูกโหลดหรือมีการเปลี่ยนแปลง
        if (profile) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            let animationFrameId;

            // ฟังก์ชันเคลียร์แคนวาส
            const clearCanvas = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            };

            // ฟังก์ชันวาดพื้นหลังด้วยสีไล่เฉด
            const drawBackground = () => {
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, "#171717");
                gradient.addColorStop(1, "#0a0a0a");
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            };

            // ฟังก์ชันวาดข้อมูลโปรไฟล์
            const drawProfileInfo = () => {
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = selectedColor;
                ctx.fillText(`${profile.name || "N/A"} (${profile.login || "N/A"})`, 40, 80);

                ctx.font = '18px Arial';
                ctx.fillStyle = '#CCCCCC';
                ctx.fillText(profile.bio || 'No bio available', 40, 120);
                ctx.fillText(`Public Repos: ${profile.public_repos || "No Public Repos"}`, 40, 150);
                ctx.fillText(`Followers: ${profile.followers}`, 40, 180);
                ctx.fillText(`Following: ${profile.following}`, 40, 210);
            };

            // ฟังก์ชันวาดรูปภาพโปรไฟล์
            const drawProfileImage = () => {
                const profileImage = new Image();
                profileImage.src = profile.avatar_url;

                profileImage.onload = () => {
                    const radius = 80;
                    const x = canvas.width - radius * 2 - 70;
                    const y = 35;

                    // วาดเงาของกรอบโปรไฟล์
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x + radius, y + radius, radius + 5, 0, 2 * Math.PI);
                    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                    ctx.fill();
                    ctx.restore();

                    // วาดกรอบวงกลมและรูปภาพโปรไฟล์
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
                    ctx.strokeStyle = selectedColor;
                    ctx.lineWidth = 5;
                    ctx.stroke();
                    ctx.closePath();
                    ctx.clip();

                    ctx.drawImage(profileImage, x, y, radius * 2, radius * 2);
                    ctx.restore();
                };

                profileImage.onerror = () => {
                    console.error("Failed to load profile image.");
                };
            };

            // ฟังก์ชันวาดกราฟข้อมูลการทำกิจกรรม
            const drawGraph = () => {
                const lineHeight = 20;
                const maxLineWidth = canvas.width - 160;
                const graphX = 100;
                const graphY = 260;

                // คำนวณจำนวนการทำกิจกรรมแต่ละประเภท
                const activityCounts = activities.reduce((counts, activity) => {
                    counts[activity.type] = (counts[activity.type] || 0) + 1;
                    return counts;
                }, {});

                const maxActivityCount = Math.max(...Object.values(activityCounts));
                const types = Object.keys(activityCounts);
                let startTime = performance.now();

                // ฟังก์ชันคำนวณการเคลื่อนไหวแบบ easeInOut
                const easeInOut = (t) => {
                    return t < 0.5 ? 2 * t : -1 + (4 - 2 * t) * t;
                };

                // ฟังก์ชันแอนิเมชั่นการวาดกราฟ
                const animateGraph = () => {
                    const elapsedTime = performance.now() - startTime;
                    const duration = 1000;
                    const progress = Math.min(elapsedTime / duration, 1);
                    const easedProgress = easeInOut(progress);
                    let allComplete = true;

                    // วาดแต่ละแถวของกราฟ
                    types.forEach((type, index) => {
                        const count = activityCounts[type];
                        const lineWidth = (count / maxActivityCount) * maxLineWidth;
                        const yOffset = graphY + (index * (lineHeight + 10));

                        // วาดเส้นสีเทาพื้นหลัง
                        ctx.beginPath();
                        ctx.moveTo(graphX, yOffset);
                        ctx.lineTo(graphX + maxLineWidth, yOffset);
                        ctx.strokeStyle = "#262626";
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        // วาดเส้นสีหลักที่เคลื่อนไหวตามข้อมูล
                        const currentLineWidth = lineWidth * easedProgress;
                        ctx.beginPath();
                        ctx.moveTo(graphX, yOffset);
                        ctx.lineTo(graphX + currentLineWidth, yOffset);
                        ctx.strokeStyle = selectedColor;
                        ctx.lineWidth = 3;
                        ctx.stroke();

                        if (progress < 1) {
                            allComplete = false;
                        }
                    });

                    // เรียกการวาดแอนิเมชั่นซ้ำจนกว่าจะเสร็จสมบูรณ์
                    if (!allComplete) {
                        animationFrameId = requestAnimationFrame(animateGraph);
                    }
                };

                animateGraph();

                // วาดข้อความและจำนวนกิจกรรมในแต่ละประเภท
                types.forEach((type, index) => {
                    const count = activityCounts[type];
                    const yOffset = graphY + (index * (lineHeight + 10));

                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '14px Arial';
                    ctx.fillText(type, graphX - 80, yOffset + 5);
                    ctx.fillText(count, graphX + maxLineWidth + 10, yOffset + 5);
                });
            };

            // เรียกฟังก์ชันวาดพื้นหลัง ข้อมูลโปรไฟล์ รูปภาพ และกราฟ
            drawBackground();
            drawProfileInfo();
            drawProfileImage();
            if (activities.length > 0) drawGraph();

            // cleanup function: เคลียร์แอนิเมชั่นและแคนวาสเมื่อ component ถูกถอดออก
            return () => {
                cancelAnimationFrame(animationFrameId);
                clearCanvas();
            };
        }
    }, [profile, activities, selectedColor]);

    return (
        <React.Fragment>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Github Username"
                className="w-full focus:outline-none text-white p-1.5 px-8 py-5 rounded-lg bg-neutral-700"
            />
            <button onClick={generateProfile} className="mt-5 p-3 text-white transition hover:bg-neutral-600 duration-200 shadow-sm shadow-black bg-neutral-700 px-8 rounded-xl">Generate Profile</button>
            <div className="mt-5">
                <label htmlFor="colorPicker" className="text-white mr-2">Choose Graph Color</label>
                <input
                    type="color"
                    id="colorPicker"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                />
            </div>
            <canvas className="mt-8" ref={canvasRef} width={1000} height={400} />
        </React.Fragment>
    )
}

export default GithubProfileCanvas;