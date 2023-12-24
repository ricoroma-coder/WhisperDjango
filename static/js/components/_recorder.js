import RecorderRequest from '../classes/_recorder_request.js'
import RecorderReplay from '../classes/_recorder_replay.js'

function get_card(element) {
    return $(element.parents('.card-panel'))
}

function set_instance(card) {
    recorder = !card.hasClass('recorded')
        ? new RecorderRequest(card)
        : new RecorderReplay(card)
}

let recorder = undefined

$('.btn-record').on('click', function () {
    set_instance(get_card($(this)))
    recorder.start()
})

$('.btn-stop').on('click', function () {
    recorder.stop()
})
