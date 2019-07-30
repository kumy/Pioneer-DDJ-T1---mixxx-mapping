////////////////////////////////////////////////////////////////////////
// JSHint configuration                                               //
////////////////////////////////////////////////////////////////////////
/* global engine                                                      */
/* global script                                                      */
/* global midi                                                        */
/* global bpm                                                         */
/* global components                                                  */
////////////////////////////////////////////////////////////////////////

var DDJ = new components.ComponentContainer();

DDJ.init = function(id, debugging) {
    DDJ.deckA = new DDJ.Deck(1, 0);
    DDJ.deckB = new DDJ.Deck(2, 1);
    DDJ.deckC = new DDJ.Deck(3, 2);
    DDJ.deckD = new DDJ.Deck(4, 3);
}

DDJ.shutdown = function() {}

DDJ.autoLoopFunc = function(channel, control, value, status, group) {
    var currentValue = engine.getParameter(group, "beatloop_size");
    var nextValue = value === 1 ? currentValue * 2 : currentValue / 2;
    if (nextValue >= 0.03125 && nextValue <= 512) {
        engine.setParameter(group, "beatloop_size", nextValue);
    }
}

DDJ.Deck = function(deckNumbers, midiChannel) {
    components.Deck.call(this, deckNumbers);
    var channel = '[Channel' + (midiChannel + 1) + ']';

    this.playButton = new components.PlayButton([0x90 + midiChannel, 0x0B]);
    this.cueButton = new components.CueButton([0x90 + midiChannel, 0x0C]);
    this.syncButton = new components.SyncButton([0x96, 0x58 + midiChannel]);

    this.keylockButton = new components.Button({
        midi: [0x90 + midiChannel, 0x1A],
        group: channel,
        key: 'keylock',
        type: components.Button.prototype.types.toggle,
        on: 0x7F,
        off: 0x00,
    });
    this.pflButton = new components.Button({
        midi: [0x96, 0x54 + midiChannel],
        group: channel,
        key: 'pfl',
        type: components.Button.prototype.types.toggle,
        on: 0x7F,
        off: 0x00,
    });

    this.hotcues = [];
    for (var i = 1; i <= 4; i++) {
        this.hotcues[i] = new components.HotcueButton({
            midi: [0x90 + midiChannel, 0x2E + i - 1],
            number: i,
        });
    }

    this.loopInButton = new components.Button({
        midi: [0x90 + midiChannel, 0x10],
        group: channel,
        key: 'loop_in',
        on: 0x7F,
        off: 0x00,
    });
    this.loopOutButton = new components.Button({
        midi: [0x90 + midiChannel, 0x11],
        group: channel,
        key: 'loop_out',
        on: 0x7F,
        off: 0x00,
    });

    this.reconnectComponents(function(c) {
        if (c.group === undefined) {
            c.group = this.currentDeck;
        }
    });
}

DDJ.Deck.prototype = new components.Deck();
