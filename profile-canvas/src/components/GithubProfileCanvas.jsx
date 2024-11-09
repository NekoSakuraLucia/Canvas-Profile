import React, { useRef, useEffect, useState } from "react";
import { fetchGithubProfile, GITUHB_API_BASE_URL } from "../api";

const GithubProfileCanvas = () => {
    const canvasRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [activities, setActivities] = useState([]);
    const [username, setUsername] = useState("");

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
        if (profile) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // ตั้งค่า Canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // พื้นหลังแบบ Gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "#171717"); // สีเริ่มต้น
            gradient.addColorStop(1, "#0a0a0a"); // สีปลาย
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // กำหนดค่าตัวอักษรและสี
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#FFC0CB'; // สีชมพูสำหรับชื่อ

            // แสดงชื่อผู้ใช้
            ctx.fillText(`${profile.name || "N/A"} (${profile.login || "N/A"})`, 40, 80);
            ctx.font = '18px Arial';
            ctx.fillStyle = '#CCCCCC'; // สีเทาสำหรับรายละเอียด

            // แสดงสถานะ
            ctx.fillText(profile.bio || 'No bio available', 40, 120);
            ctx.fillText(`Public Repos: ${profile.public_repos || "No Public Repos"}`, 40, 150)
            ctx.fillText(`Followers: ${profile.followers}`, 40, 180)
            ctx.fillText(`Following: ${profile.following}`, 40, 210)

            // โหลดรูปโปรไฟล์และวาดลงบน Canvas
            const profileImage = new Image();
            profileImage.src = profile.avatar_url;
            profileImage.onload = () => {
                // วาดรูปโปรไฟล์ในลักษณะวงกลม
                const radius = 80;
                const x = canvas.width - radius * 2 - 70;
                const y = 35;

                // วาดเงาใต้รูปโปรไฟล์
                ctx.save();
                ctx.beginPath();
                ctx.arc(x + radius, y + radius, radius + 5, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fill();
                ctx.restore();

                // กรอปรูปโปรไฟล์
                ctx.save();
                ctx.beginPath();
                ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = "#FFC0CB";
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.closePath();
                ctx.clip();

                // วาดรูปโปรไฟล์
                ctx.drawImage(profileImage, x, y, radius * 2, radius * 2);
                ctx.restore();
            }

            if (activities.length > 0) {
                const lineHeight = 20; // ระยะห่างระหว่างเส้นแต่ละเส้น
                const maxLineWidth = canvas.width - 160; // กำหนดความกว้างของกราฟ
                const graphX = 100; // ตำแหน่ง X เริ่มต้น
                const graphY = 260; // ตำแหน่ง Y เริ่มต้น

                // คำนวณค่าความถี่ของกิจกรรมแต่ละประเภท
                const activityCounts = activities.reduce((counts, activity) => {
                    counts[activity.type] = (counts[activity.type] || 0) + 1;
                    return counts;
                }, {});

                const maxActivityCount = Math.max(...Object.values(activityCounts));

                // วาดกราฟเส้น
                const types = Object.keys(activityCounts);
                types.forEach((type, index) => {
                    const count = activityCounts[type];
                    const lineWidth = (count / maxActivityCount) * maxLineWidth; // ความยาวของเส้นตามค่าความถี่
                    const yOffset = graphY + (index * (lineHeight + 10));

                    // วาดเส้นสีเทา (เส้นจำนวนเต็มของระดับกิจกรรม)
                    ctx.beginPath();
                    ctx.moveTo(graphX, yOffset);
                    ctx.lineTo(graphX + maxLineWidth, yOffset); // ใช้ความยาวเต็มของกราฟ
                    ctx.strokeStyle = "#262626";
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // วาดเส้นสีชมพู (เส้นจำนวน Counts)
                    ctx.beginPath();
                    ctx.moveTo(graphX, yOffset);
                    ctx.lineTo(graphX + lineWidth, yOffset); // ใช้ความยาวตามจำนวน Counts
                    ctx.strokeStyle = "#FFC0CB"; // สีชมพูสำหรับเส้น
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // แสดงชื่อประเภทกิจกรรมทางด้านซ้าย
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '14px Arial';
                    ctx.fillText(type, graphX - 80, yOffset + 5);

                    // แสดงตัวเลขค่าความถี่ทางขวาของเส้น
                    ctx.fillText(count, graphX + maxLineWidth + 10, yOffset + 5);
                });
            }
        }
    }, [profile, activities])

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
            <canvas className="mt-8" ref={canvasRef} width={800} height={400} />
        </React.Fragment>
    )
}

export default GithubProfileCanvas;