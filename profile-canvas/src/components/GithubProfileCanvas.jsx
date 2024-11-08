import React, { useRef, useEffect, useState } from "react";
import { fetchGithubProfile } from "../api";

const GithubProfileCanvas = () => {
    const canvasRef = useRef(null);
    const [profile, setProfile] = useState(null);
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
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // ตั้งค่า Canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#1A1A1A';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // กำหนดค่าตัวอักษรและสี
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#FFC0CB'; // สีชมพูสำหรับชื่อ

            // แสดงชื่อผู้ใช้
            ctx.fillText(profile.name || 'N/A', 40, 80);
            ctx.font = '18px Arial';
            ctx.fillStyle = '#CCCCCC'; // สีเทาสำหรับรายละเอียด

            // แสดงสถานะ
            ctx.fillText(profile.bio || 'No bio available', 40, 120);
            ctx.fillText(`Public Repos: ${profile.public_repos || "No Public Repos"}`, 40, 150)

            // โหลดรูปโปรไฟล์และวาดลงบน Canvas
            const profileImage = new Image();
            profileImage.src = profile.avatar_url;
            profileImage.onload = () => {
                // วาดรูปโปรไฟล์ในลักษณะวงกลม
                const radius = 50;
                ctx.save();
                ctx.beginPath();
                ctx.arc(250, 80, radius, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(profileImage, 200, 30, radius * 2, radius * 2);
                ctx.restore();
            }
        }
    }, [profile])

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
            <canvas ref={canvasRef} width={800} height={200} />
        </React.Fragment>
    )
}

export default GithubProfileCanvas;