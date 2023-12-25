import Recorder from './_recorder.js'

export default class RecorderRequest extends Recorder {
    start() {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then ((stream) => {
            this.stream = stream
            this.set_media_recorder()
            super.start(() => {
                if (this.media_recorder && this.media_recorder.state !== 'recording')
                    this.media_recorder.start()
            })
        })
        .catch((err) => {
            console.log('Erro ao acessar o microfone:', err)
            alert('Erro ao acessar o microfone')
        })
    }

    clear_interval() {
        super.clear_interval(() => {
            if (this.media_recorder && this.media_recorder.state === 'recording') {
                clearInterval(this.interval)
                if (this.stream)
                    this.stream.getTracks().forEach(track => track.stop())
                this.media_recorder.stop()
            }
        })
    }
}