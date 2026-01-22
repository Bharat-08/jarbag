import React from 'react';
import ReactPlayer from 'react-player';

export default function TestVimeo() {
    return (
        <div style={{ width: '800px', margin: '50px auto' }}>
            <h2>Vimeo Test Player</h2>

            <ReactPlayer
                url="https://player.vimeo.com/video/1156730233"
                controls
                width="100%"
                height="450px"
                config={{
                    vimeo: {
                        playerOptions: {
                            responsive: true,
                            dnt: true
                        }
                    }
                }}
            />
        </div>
    );
}
