from flask import Flask, request, send_file
from PIL import Image, ImageDraw, ImageFont
import requests
from io import BytesIO
from typing import Dict, Any

app = Flask(__name__)

BASE_URI = "https://api.github.com"

@app.route("/api/profile-image")
def animated_canvas_profile():
    username = request.args.get("username")
    color = request.args.get("color", "ff5733")

    if not username:
        return "Error: Please provide a Github Username", 400
    
    github_url = f"{BASE_URI}/users/{username}"
    response = requests.get(github_url)
    if response.status_code != 200:
        return "Error: Github user not found", 404
    profile_data: Dict[str, Any] = response.json()

    width, height = 800, 400
    frames = []
    font = ImageFont.load_default()

    for i in range(10):
        image = Image.new("RGB", (width, height), (17, 17, 17))
        draw = ImageDraw.Draw(image)

        selected_color = tuple((int(color[j:j+2], 16) + i*10) % 255 for j in (0, 2, 4))

        avatar_url = profile_data.get("avatar_url")
        avatar_response = requests.get(avatar_url)
        avatar = Image.open(BytesIO(avatar_response.content)).resize((150, 150))

        image.paste(avatar, (50, 50))
        
        draw.text((220, 50 + i), f"{profile_data['name'] or 'N/A'} ({username})", fill=selected_color, font=font)
        draw.text((220, 100), f"Bio: {profile_data['bio'] or 'No bio'}", fill=(200, 200, 200), font=font)
        draw.text((220, 150), f"Public Repos: {profile_data['public_repos']}", fill=(200, 200, 200), font=font)
        draw.text((220, 200), f"Followers: {profile_data['followers']}", fill=(200, 200, 200), font=font)
        draw.text((220, 250), f"Following: {profile_data['following']}", fill=(200, 200, 200), font=font)

        frames.append(image)

    if isinstance(frames[0], Image.Image):
        output = BytesIO()
        frames[0].save(output, format='GIF', save_all=True, append_images=frames[1:], duration=200, loop=0)
        output.seek(0)

        # ส่ง GIF กลับ
        return send_file(output, mimetype="image/gif")
    else:
        return "Error: No images in frames to save", 500
    
if __name__ == "__main__":
    app.run(debug=True)