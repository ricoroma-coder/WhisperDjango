export default class Recorder {
    constructor(element) {
        this.interval = undefined
        this.element = element
        this.stream = undefined
        this.max_seconds = 180
        this.media_recorder = undefined
        this.chunks = []
    }

    start() {}

    stop() {}

    prepare_card() {
        if (!this.element.hasClass('opened'))
            this.element.addClass('opened')

        if (!this.element.hasClass('recorded')) {
            let recorder = $(this.element.find('.btn-record')),
                stop = $(recorder.siblings('.btn-stop'))

            recorder.addClass('d-none')
            stop.removeClass('d-none')
        }
    }

    set_media_recorder() {
        this.media_recorder = new MediaRecorder(this.stream);

        this.media_recorder.ondataavailable = (event) => {
            if (event.data.size > 0)
                this.chunks.push(event.data)
        }

        this.media_recorder.onstop = () => {
            this.blob = new Blob(this.chunks, { type: 'audio/mp3;' })
            $(this.element.find('audio'))[0].src = window.URL.createObjectURL(this.blob)
        }
    }
}