// functions/upload-photo.js
const axios = require('axios');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Extract the necessary information
    const {
      caption,
      timestamp,
      location,
      filename,
      imageData
    } = data;
    
    // Prepare metadata
    const metadataFilename = filename.replace('.jpg', '.json');
    const metadata = {
      caption,
      timestamp,
      location
    };

    // Trigger the GitHub Action via repository_dispatch event
    const result = await axios.post(
      `https://api.github.com/repos/JonathanBurez/JonathanBurez.github.io/dispatches`,
      {
        event_type: 'photo-upload',
        client_payload: {
          filename: filename,
          metadataFilename: metadataFilename,
          imageData: imageData,
          metadata: metadata,
          caption: caption
        }
      },
      {
        headers: {
          'Authorization': `token ${process.env.GITHUB_PAT}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Photo upload initiated' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Upload failed', error: error.message })
    };
  }
};
