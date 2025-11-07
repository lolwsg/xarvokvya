body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
    font-family: 'Arial', sans-serif;
    background-color: #000;
    color: #fff;
}

.video-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: -100;
}

.video-background video {
    position: absolute;
    top: 50%;
    left: 50%;
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    transform: translate(-50%, -50%);
    z-index: -100;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: -50;
}

.container {
    position: relative;
    z-index: 100;
    text-align: center;
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

h1 {
    font-size: 2.5em;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px #000;
}

p {
    font-size: 1.2em;
    margin: 10px 0;
}

.info-section {
    margin-top: 40px;
}

.info-section h2 {
    font-size: 2em;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px #000;
}

.data-item {
    font-size: 1.1em;
    margin: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    padding: 10px 20px;
    font-size: 1.2em;
    cursor: pointer;
    background-color: #007BFF;
    color: white;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    text-shadow: 1px 1px 2px #000;
}

button:hover {
    background-color: #0056b3;
}
