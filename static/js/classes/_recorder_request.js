import Recorder from './_recorder.js'

import {
    calc_time,
    time_to_decimal,
    decimal_to_seconds
} from '../general_functions.js'

export default class RecorderRequest extends Recorder {
    start() {
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then ((stream) => {
            this.stream = stream
            this.set_media_recorder()
            this.prepare_card()
            this.interval = setInterval(() => { this.recording() }, 1000)
        })
        .catch((err) => {
            console.log('Erro ao acessar o microfone:', err)
            alert('Erro ao acessar o microfone')
        })
    }

    recording() {
        let triggers = $(this.element.find('.triggers')),
            options = $(triggers.siblings('.options')),
            chronometer_current = $(options.find('.chronometers .chronometer-current span')),
            current = chronometer_current.text(),
            minutes = parseInt(current.split(':')[0]),
            seconds = parseInt(current.split(':')[1]),
            max = parseInt(triggers.attr('aria-max'))

        let info = calc_time(minutes, seconds, max),
            acc = info.acc,
            perc = info.perc

        minutes = info.minutes
        seconds = info.seconds

        current = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')

        if (this.media_recorder && this.media_recorder.state !== 'recording')
            this.media_recorder.start()

        chronometer_current.html(acc == max ? '03:00' : current)
        $(options.find('.progress .determinate')).css('width', `${perc}%`)

        if (acc == max)
            this.stop()
    }

    clear_interval() {
        $('#spinner').removeClass('d-none')

        let triggers = $(this.element.find('.triggers')),
            options = $(triggers.siblings('.options')),
            chronometer_current = $(options.find('.chronometer-current span'))

        this.max_seconds = decimal_to_seconds(time_to_decimal(chronometer_current.text()))

        $(triggers.find('.btn-stop')).addClass('d-none')
        $(triggers.find('.btn-record')).removeClass('d-none').attr('disabled', 'true')

        $(options.find('.chronometer-max span')).html(chronometer_current.text())
        triggers.attr('aria-max', this.max_seconds)
        chronometer_current.html('00:00')
        $(options.find('.progress .determinate')).css('width', '0%')

        this.stop_recording()

        $('#spinner').addClass('d-none')
        $('#response-voice').removeClass('d-none')
        this.element.addClass('recorded')
        $(triggers.find('.btn-record')).removeAttr('disabled')
    }

    stop() {
        this.clear_interval()
    }

    stop_recording() {
        if (this.media_recorder && this.media_recorder.state === 'recording') {
            clearInterval(this.interval)
            this.media_recorder.stop()
            if (this.stream)
                this.stream.getTracks().forEach(track => track.stop())
        }
    }
}