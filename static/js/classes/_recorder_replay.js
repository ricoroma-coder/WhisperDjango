import Recorder from './_recorder.js'

export default class RecorderReplay extends Recorder {
    start() {
        super.start(() => {
            let audio = $(this.element.find('audio'))[0]

            if (audio.paused)
                audio.play()
        })
    }

    clear_interval() {
        super.clear_interval(() => {
            let audio = $(this.element.find('audio'))[0]

            if (!audio.paused) {
                audio.pause()
                audio.currentTime = 0
            }

            clearInterval(this.interval)
        })
    }
}
