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
                    setActivities(data.slice(0, 5));
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
                const progressBarHeight = 30;
                const barX = 40;
                const barY = 240;
                const barWidth = canvas.width - 80;
                const maxActivities = 5; // จำนวนกิจกรรมที่เราดึงมาแสดง

                activities.forEach((activity, index) => {
                    const progress = (index + 1) / maxActivities * 100; // คำนวณค่าความคืบหน้า
                    const yOffset = barY + (index * (progressBarHeight + 10));

                    // วาด Progress Bar
                    ctx.fillStyle = '#171717';
                    ctx.fillRect(barX, yOffset, barWidth, progressBarHeight); // พื้นหลังของ Progress Bar

                    ctx.fillStyle = '#212121'; // สีของ Progress
                    ctx.fillRect(barX, yOffset, (progress / 100) * barWidth, progressBarHeight); // สีของ Progress ตามค่าความคืบหน้า

                    // แสดงข้อความภายใน Progress Bar
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '14px Arial';
                    ctx.fillText(`${activity.type}`, barX + 10, yOffset + progressBarHeight / 2 + 5);
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