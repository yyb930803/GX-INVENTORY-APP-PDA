import SoundPlayer from 'react-native-sound';

class Sound {
    constructor() {
        this.sounds = {
            0: 'zero.mp3',
            1: 'one.mp3',
            2: 'two.mp3',
            3: 'three.mp3',
            4: 'four.mp3',
            5: 'five.mp3',
            6: 'six.mp3',
            7: 'seven.mp3',
            8: 'eight.mp3',
            9: 'nine.mp3',
            alert: 'error.mp3',
            scan: 'scan.mp3',
            dian: 'dian.mp3',
        };

        this.audioPlayer = {};
        this.loadSounds();
    }

    loadSounds = () => {
        Object.keys(this.sounds).forEach((key) => {
            const sound = new SoundPlayer(this.sounds[key], SoundPlayer.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.warn(`Failed to load sound '${key}':`, error);
                }
            });
            this.audioPlayer[key] = sound;
        });
    };

    playSound = (key) => {
        if (key in this.audioPlayer) {
            this.audioPlayer[key].play();
        }
    };

    playKeySound = (key) => {
        switch (key) {
            case 7:
                this.playSound(0);
                break;
            case 8:
                this.playSound(1);
                break;
            case 9:
                this.playSound(2);
                break;
            case 10:
                this.playSound(3);
                break;
            case 11:
                this.playSound(4);
                break;
            case 12:
                this.playSound(5);
                break;
            case 13:
                this.playSound(6);
                break;
            case 14:
                this.playSound(7);
                break;
            case 15:
                this.playSound(8);
                break;
            case 16:
                this.playSound(9);
                break;
            case 18:
                this.playSound('dian');
                break;
        
            default:
                break;
        }
    }
}

const SoundObject = new Sound();
export default SoundObject;
