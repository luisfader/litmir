"""Eight piano pieces for «Северная любовь: Восточный ветер».
Each bar: (chord symbol, right-hand melody). Melody tokens: NOTE/beats, r/beats (rest).
Left hand is generated from the chord with the piece's pattern."""

PIECES = [
 dict(ch=1, slug="01-tyoplyj-veter", title="Тёплый ветер", key=2, beats=4, bpm=72,
      tempo="Andante, dolce", lh="arp", bars="""
D   | F#4/1 A4/1 D5/1.5 E5/.5
A/C# | C#5/2 A4/2
Bm  | B4/1 D5/1 F#5/1.5 E5/.5
G   | D5/3 r/1
D   | A4/1 D5/1 F#5/1 A5/1
A   | G5/1.5 F#5/.5 E5/2
G   | D5/1 E5/.5 F#5/.5 G5/1 B4/1
A   | A4/4
Bm  | F#5/1.5 E5/.5 D5/1 F#5/1
G   | G5/1 F#5/1 E5/1 D5/1
D   | F#5/1 A5/1 F#5/1 D5/1
A   | E5/3 C#5/1
G   | D5/1 B4/1 G4/1 B4/1
A   | E5/2 C#5/2
D   | D5/4
D   | F#4/1 A4/1 D5/2
"""),
 dict(ch=2, slug="02-pesnya-na-lugu", title="Песня на лугу", key=-1, beats=3, bpm=84,
      tempo="Allegretto, cantabile", lh="arp", bars="""
F   | A4/2 C5/1
C/E | G4/2 E4/1
Dm  | F4/1 A4/1 D5/1
Bb  | D5/2 C5/1
F   | A4/1.5 Bb4/.5 C5/1
Gm  | D5/2 Bb4/1
C   | G4/1 A4/1 Bb4/1
C   | G4/3
F   | C5/1 F5/1 E5/1
Dm  | D5/2 A4/1
Bb  | Bb4/1 D5/1 F5/1
F   | F5/1.5 E5/.5 C5/1
Gm  | D5/1 C5/1 Bb4/1
C   | G4/1 C5/1 E5/1
F   | F4/1.5 G4/.5 A4/1
F   | F4/3
"""),
 dict(ch=3, slug="03-slishkom-khorosho", title="Слишком хорошо", key=1, beats=4, bpm=63,
      tempo="Lento, quasi sognando", lh="half", bars="""
G   | B4/2 D5/1 B4/1
Em  | G4/2 B4/2
C   | C5/1 E5/1 G5/1 E5/1
D   | D5/3 r/1
G   | B4/1 C5/1 D5/1 G5/1
Em  | E5/2 B4/2
Am  | C5/1.5 B4/.5 A4/1 E5/1
D   | D5/4
G   | G5/2 F#5/1 G5/1
C   | E5/2 C5/2
Cm  | Eb5/2 G5/1 Eb5/1
G   | D5/2 B4/2
Em  | G4/1 B4/1 E5/1 G5/1
C   | G5/1.5 E5/.5 C5/2
D   | C5/1 A4/1 F#4/2
G   | G4/4
"""),
 dict(ch=4, slug="04-ledyanoj-feniks", title="Ледяной феникс", key=1, beats=4, bpm=76,
      tempo="Andante misterioso", lh="arp", bars="""
Em  | B5/1 G5/.5 E5/.5 B4/1 E5/1
C   | G5/2 E5/2
G   | D5/1 G5/1 B5/1 D6/1
D   | A5/3 F#5/1
Em  | E5/.5 G5/.5 B5/1 A5/1 G5/1
C   | E5/2 C5/2
Am  | A4/1 C5/1 E5/1 A5/1
B   | F#5/3 D#5/1
Em  | E5/1 B5/1 E6/1 B5/1
C   | C6/2 G5/2
G   | B5/1 G5/.5 D5/.5 G5/1 B5/1
D   | A5/2 F#5/2
C   | G5/1 E5/1 C5/1 E5/1
Am  | A5/1.5 G5/.5 E5/2
B   | F#5/1 D#5/1 B4/2
Em  | E5/4
"""),
 dict(ch=5, slug="05-rov", title="Ров", key=-1, beats=4, bpm=88,
      tempo="Moderato, deciso", lh="arp", bars="""
Dm  | D5/1.5 D5/.5 F5/1 A5/1
Dm  | G5/1 F5/1 E5/1 D5/1
Bb  | D5/1.5 D5/.5 F5/1 Bb5/1
C   | A5/2 G5/2
Dm  | F5/1 E5/1 D5/1 A4/1
Gm  | Bb4/1 D5/1 G5/2
A   | E5/1 C#5/1 A4/1 C#5/1
A   | E5/4
Dm  | D5/1 F5/1 A5/1 D6/1
F   | C6/2 A5/2
Gm  | Bb5/1 G5/1 D5/1 G5/1
A   | A5/3 r/1
Bb  | F5/1 D5/1 Bb4/1 D5/1
C   | E5/1 G5/1 C6/1 G5/1
A7  | C#5/1 E5/1 A5/1 G5/1
Dm  | D5/4
"""),
 dict(ch=6, slug="06-mosty", title="Мосты", key=-2, beats=4, bpm=80,
      tempo="Agitato, ma non troppo", lh="arp", bars="""
Gm  | G4/1 Bb4/1 D5/1.5 C5/.5
Gm  | Bb4/1 A4/1 G4/2
Eb  | G4/1 Bb4/1 Eb5/1.5 D5/.5
D   | D5/2 F#4/2
Gm  | G4/.5 A4/.5 Bb4/1 D5/1 G5/1
Cm  | Eb5/2 C5/2
D   | D5/1 F#5/1 A5/1 F#5/1
D   | D5/3 r/1
Eb  | Eb5/1 G5/1 Bb5/1 G5/1
Bb  | F5/2 D5/2
Cm  | Eb5/1 C5/1 G4/1 C5/1
D   | A4/2 F#5/2
Gm  | G5/1.5 F5/.5 D5/1 Bb4/1
Eb  | Eb5/1 G5/1 Bb5/2
D7  | A5/1 F#5/1 D5/1 C5/1
Gm  | Bb4/1 A4/1 G4/2
"""),
 dict(ch=7, slug="07-iz-siyaniya", title="Та, что пришла из сияния", key=0, beats=4, bpm=66,
      tempo="Maestoso, con anima", lh="whole", bars="""
C   | C5/1 E4/1 B4/1 E4/1
C   | G4/4
G   | B4/1 D4/1 A4/1 D4/1
Am  | A4/4
F   | F5/1 E5/1 D5/1 C5/1
G   | D5/2 G5/2
C   | E5/1 G5/1 C6/1 G5/1
C   | E5/4
F   | A5/1.5 G5/.5 F5/1 C5/1
G   | D5/1 G5/1 B5/2
Em  | B5/1 G5/1 E5/1 G5/1
Am  | C6/2 A5/2
F   | A5/1 C6/1 F5/1 A5/1
G   | B5/2 D6/2
C   | C6/1 E5/1 B5/1 E5/1
C   | G5/4
Am  | A5/1 C6/1 E6/1 C6/1
F   | F5/1 A5/1 C6/2
G   | D6/2 B5/2
C   | C6/4
"""),
 dict(ch=8, slug="08-stena", title="Стена", key=2, beats=4, bpm=69,
      tempo="Andante tranquillo", lh="arp", bars="""
D   | D5/1 F#4/1 C#5/1 F#4/1
D   | A4/4
A   | C#5/1 E4/1 B4/1 E4/1
Bm  | B4/4
G   | B4/1 D5/1 G5/1.5 F#5/.5
D   | F#5/2 D5/2
Em  | E5/1 G5/1 B5/1 G5/1
A   | A5/2 E5/2
D   | F#5/1 A5/1 D6/1 A5/1
Bm  | B5/2 F#5/2
G   | G5/1 B5/1 D6/1 B5/1
A   | C#6/2 A5/2
D   | D6/1 F#5/1 C#6/1 F#5/1
G   | B5/2 G5/2
A   | A5/1 E5/1 C#5/1 E5/1
D   | D5/4
"""),
]

LETTERS = "CDEFGAB"
SEMI = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
SHARPS = "FCGDAEB"


class Note:
    __slots__ = ("letter", "acc", "octave")
    def __init__(self, letter, acc, octave):
        self.letter, self.acc, self.octave = letter, acc, octave
    @property
    def midi(self): return 12 * (self.octave + 1) + SEMI[self.letter] + self.acc
    @property
    def dia(self): return self.octave * 7 + LETTERS.index(self.letter)
    def __repr__(self): return f"{self.letter}{'#'*self.acc if self.acc>0 else 'b'*-self.acc}{self.octave}"


def parse_note(s):
    letter = s[0]; i = 1; acc = 0
    while i < len(s) and s[i] in "#b":
        acc += 1 if s[i] == '#' else -1; i += 1
    return Note(letter, acc, int(s[i:]))


def key_acc(fifths):
    """letter -> accidental from key signature"""
    d = {l: 0 for l in LETTERS}
    if fifths > 0:
        for l in SHARPS[:fifths]: d[l] = 1
    else:
        for l in SHARPS[::-1][:-fifths]: d[l] = -1
    return d


def note_up(n, letters, semis):
    """note `letters` diatonic steps and `semis` semitones above n, spelled correctly"""
    li = LETTERS.index(n.letter) + letters
    letter = LETTERS[li % 7]; octave = n.octave + li // 7
    target = n.midi + semis
    base = 12 * (octave + 1) + SEMI[letter]
    return Note(letter, target - base, octave)


def chord_tones(sym):
    """returns (root Note at octave 2, quality intervals list [(letters, semis)], bass Note or None)"""
    bass = None
    if '/' in sym:
        sym, b = sym.split('/'); bass = parse_note(b + '2')
    i = 1
    while i < len(sym) and sym[i] in '#b': i += 1
    root = parse_note(sym[:i] + '2'); q = sym[i:]
    third = (2, 3) if q.startswith('m') else (2, 4)
    ivs = [(0, 0), third, (4, 7)]
    if q.endswith('7'):
        ivs.append((6, 10))
    return root, ivs, bass


def fit(n, lo=36, hi=48):  # C2..C3
    while n.midi < lo: n = Note(n.letter, n.acc, n.octave + 1)
    while n.midi > hi: n = Note(n.letter, n.acc, n.octave - 1)
    return n


def left_hand(sym, beats, pattern):
    root, ivs, bass = chord_tones(sym)
    root = fit(root, 38, 49)
    b = fit(bass, 36, 49) if bass else root
    fifth = note_up(root, 4, 7)
    third_up = note_up(root, 9, 16) if ivs[1] == (2, 4) else note_up(root, 9, 15)
    octave = note_up(root, 7, 12)
    seventh = note_up(root, 6, 10) if len(ivs) > 3 else None
    if bass and b.midi >= fifth.midi:
        b = Note(b.letter, b.acc, b.octave - 1)
    if pattern == "arp":
        if beats == 4:
            top = seventh if seventh else octave
            seq = [b, fifth, top, third_up]
        else:
            seq = [b, fifth, third_up]
        return [([n], 1) for n in seq]
    chord = [b, fifth, third_up] if not seventh else [b, fifth, seventh, third_up]
    if pattern == "half":
        return [(chord, 2)] * (beats // 2) + ([(chord, 1)] if beats % 2 else [])
    if pattern == "whole":
        lowoct = Note(b.letter, b.acc, b.octave - 1)
        return [([lowoct, b, fifth, third_up], beats)]


def build(p):
    bars = []
    for line in p["bars"].strip().splitlines():
        sym, mel = [x.strip() for x in line.split('|')]
        rh = []
        for tok in mel.split():
            n, d = tok.split('/'); d = float(d)
            rh.append(([] if n == 'r' else [parse_note(n)], d))
        assert abs(sum(d for _, d in rh) - p["beats"]) < 1e-6, (p["title"], line)
        lh = left_hand(sym, p["beats"], p["lh"])
        bars.append(dict(chord=sym, rh=rh, lh=lh))
    return bars
