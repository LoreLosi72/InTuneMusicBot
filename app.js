const TelegramBot = require('node-telegram-bot-api');
const Token = '1678347400:AAHDnLRNTQVCQDuT-i7h5TzYdvh7QforvtM';
const DeezerPublicApi = require('deezer-public-api');
let deezer = new DeezerPublicApi();
var emoji = require('node-emoji');
const itunes = require('itunes-web-api');
const express = require('express');
const app = express();
const { on } = require('node-telegram-bot-api');
const ejs = require('ejs');
app.set('view engine', 'ejs');
var rp = require('request-promise');
const PORT = process.env.PORT || 5000;
//EMOJY
const trophy = emoji.get('trophy');
const music = emoji.get('musical_note');
const medal = emoji.get('medal');
const guitar = emoji.get('guitar');
const md_s = emoji.get('sports_medal');
const one = emoji.get('first_place_medal');
const sec = emoji.get('second_place_medal');
const th = emoji.get('third_place_medal');
const link = emoji.get('link');
const microphone = emoji.get('microphone');
const duration = emoji.get('timer_clock');
const fans = emoji.get('chart_with_upwards_trend');
const genre = emoji.get('guitar');

const album = emoji.get('dvd');
const canzone = emoji.get('notes');
const money = emoji.get('moneybag');
const date = emoji.get('date');


app.use(express.urlencoded({
    extended: true
}));
const bot = new TelegramBot(Token, {
    polling: true
});
//bot
bot.onText(/\/start/, (msg) => {
    var sito = "https://intunemusic-telegram.herokuapp.com/";
    bot.sendMessage(msg.chat.id, "Benvenuto su InTuneMusicBot, Tutte le informazioni live su artisti, canzoni, playlist, album e classifiche" + guitar, {
        "reply_markup": {
            "keyboard": [
                ["/findartist", "/topsongartist", "/toptenartist"],
                ["/findtrackdeezer", "/findtrackitunes", "/toptentracks"],
                ["/findplaylist", "toptenalbum"]
            ]
        }
    });
});

//FIND ARTIST
bot.onText(/\/findartist/, (msg, match) => {
    var nome = "";
    bot.sendMessage(msg.chat.id, "Quale artista vuoi cercare?").then(playload => {
        bot.once('message', (msg) => {
            nome = msg.text;
            deezer.search.artist(nome).then(async function(artist) {

                console.log(artist);
                let number = "";

                if (999999 >= artist.data[0].nb_fan && artist.data[0].nb_fan >= 2000) {
                    number = "mila";
                } else if (artist.data[0].nb_fan >= 1000000) {
                    number = "miglioni";
                }

                let data = await itunes.artist(artist.data[0].name, { lang: 'it', country: 'IT' })
                console.log(data.results)

                let messaggio = "";
                messaggio += microphone + " NOME: " + artist.data[0].name + "\n";
                messaggio += album + " ALBUMS: " + artist.data[0].nb_album + "\n";
                messaggio += fans + " FANS: " + artist.data[0].nb_fan + " " + number + "\n";
                messaggio += guitar + " GENERE: " + data.results[0].primaryGenreName + "\n";
                messaggio += link + " LINK DEEZER: " + "<a href=\"" + artist.data[0].link + "  \">" + artist.data[0].name + "Deez</a>";

                await bot.sendMessage(msg.chat.id, "<b>" + messaggio + "</b>", {
                    parse_mode: "HTML"
                });

                await bot.sendMessage(msg.chat.id, "<b>" + link + " LINK ITUNES: " + "<a href=  \"" + data.results[0].artistLinkUrl + "\">" + artist.data[0].name + "Itunes</a></b>", {
                    parse_mode: "HTML"
                });
            });
        })
    })

});


//TOPSONG ARTIST
bot.onText(/\/topsongartist/, (msg, match) => {
    var nome = "";
    bot.sendMessage(msg.chat.id, "Di quale artista vuoi sapere le 5 TopSong?").then(playload => {
        bot.once('message', (msg) => {
            nome = msg.text;
            deezer.search.artist(nome).then(async function(artista) {

                deezer.artist.top(artista.data[0].id).then(async function(top_song) {

                    for (let i = 0; i < 5; i++) {

                        let messaggio = "";

                        messaggio += canzone + " CANZONE: " + top_song.data[i].title + "\n";
                        messaggio += microphone + " ARTISTA: " + artista.data[0].name + "\n";
                        messaggio += duration + " DURATA: " + Durata(top_song.data[i].duration.toFixed(2)) + " min\n";
                        messaggio += trophy + " RANK: " + top_song.data[i].rank + "\n";
                        messaggio += link + " LINK DEEZER: <a href=\"" + top_song.data[i].link + "  \">" + top_song.data[i].title + "/Deez</a>";

                        await bot.sendMessage(msg.chat.id, "<b>" + messaggio + "</b>", {
                            parse_mode: "HTML"
                        });

                        await bot.sendAudio(msg.chat.id, top_song.data[i].preview, { caption: "ASCOLTA LA PREVIEW DEL BRANO! " + album })

                        if (i != 4)
                            await bot.sendMessage(msg.chat.id, guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar);
                    }
                })
            })
        })
    })
});


//FIND PLAYLIST
bot.onText(/\/findplaylist/, (msg, match) => {

        var nome = "";
        var limite;
        bot.sendMessage(msg.chat.id, "Quale canzone vuoi cercare con Deezer?").then(playload => {
            bot.once('message', (msg) => {
                nome = msg.text;
                bot.sendMessage(msg.chat.id, "Quanti risultati vuoi visualizzare?").then(playload => {
                    bot.once('message', (msg) => {
                        limite = msg.text;
                        deezer.search.playlist(nome, 1, limite).then(async function(playlist) {

                            for (let i = 0; i < limite; i++) {

                                let messaggio = link + " LINK DEEZER:" + "<a href=\"" + playlist.data[i].link + "\">PlaylistLinkDeezer</a>";
                                await bot.sendPhoto(msg.chat.id, playlist.data[i].picture_xl, { caption: canzone + playlist.data[i].title + "\nLa seguente playlist contiene " + playlist.data[i].nb_tracks + " canzoni." })
                                await bot.sendMessage(msg.chat.id, "<b>" + messaggio + "</b>", {
                                    parse_mode: "HTML"
                                });
                                await bot.sendMessage(msg.chat.id, guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar);

                            }
                        });
                    })
                })
            })
        })

    })
    //TOPTEN ARTIST
bot.onText(/\/toptenartist/, (msg, match) => {
    deezer.chart.artists().then(async function(chart) {
        messaggio = trophy + " TOP TEN ARTISTI:\n";
        bot.sendMessage(msg.chat.id, "<b>" + messaggio + "</b>", {
            parse_mode: "HTML"
        });
        console.log(chart);
        for (let i = 0; i < chart.total; i++) {
            let msg_artist = "";
            if (i == 0)
                msg_artist += one + " POSIZIONE: " + chart.data[i].position + "\n";
            else if (i == 1)
                msg_artist += sec + " POSIZIONE: " + chart.data[i].position + "\n";
            else if (i == 2)
                msg_artist += th + " POSIZIONE: " + chart.data[i].position + "\n";
            else
                msg_artist += md_s + " POSIZIONE: " + chart.data[i].position + "\n";

            msg_artist += microphone + " NOME: " + chart.data[i].name + "\n";
            msg_artist += link + " LINK DEEZER: " + "<a href=\"" + chart.data[i].link + "\">" + chart.data[i].name + "Deezer</a>";
            await bot.sendMessage(msg.chat.id, "<b>" + msg_artist + "</b>", {
                parse_mode: "HTML"
            });

            if (i != 9)
                await bot.sendMessage(msg.chat.id, guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar);
        }

    });
});

//TOPTEN ALBUM
bot.onText(/\/toptenalbum/, (msg, match) => {
    deezer.chart.albums().then(async function(topten) {
        console.log(topten.data[0].artist);
        bot.sendMessage(msg.chat.id, trophy + " TopTen Albums su Deezer:", {
            parse_mode: "HTML"
        });
        for (let i = 0; i < 10; i++) {

            let messaggio = link + " LINK DEEZER:" + "<a href=\"" + topten.data[i].link + "\">AlbumLinkDeezer</a>";
            await bot.sendPhoto(msg.chat.id, topten.data[i].cover_xl, { caption: medal + topten.data[i].position + "\n" + album + " Titolo: " + topten.data[i].title + "\n" + microphone + " Artista: " + topten.data[i].artist.name });
            await bot.sendMessage(msg.chat.id, "<b>" + messaggio + "</b>", {
                parse_mode: "HTML"
            });
            await bot.sendMessage(msg.chat.id, guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar);
        }
    })

});

//FIND TRACK DEEZER
bot.onText(/\/findtrackdeezer/, (msg, match) => {
    var nome = "";
    var limite;
    bot.sendMessage(msg.chat.id, "Quale canzone vuoi cercare con Deezer?").then(playload => {
        bot.once('message', (msg) => {
            nome = msg.text;
            bot.sendMessage(msg.chat.id, "Quanti risultati vuoi visualizzare?").then(playload => {
                bot.once('message', (msg) => {
                    limite = msg.text;
                    deezer.search.track(nome, limite).then(async function(tracks) {
                        console.log(tracks);
                        if (tracks.total == 0) {
                            await bot.sendMessage(msg.chat.id, "<b>Non è stata trovata nessuna canzone con il titolo " + track_nome + "</b>", {
                                parse_mode: "HTML"
                            });
                        } else {
                            for (let i = 0; i < limite; i++) {

                                let messaggio = "";

                                messaggio += canzone + " CANZONE: " + tracks.data[i].title + "\n";
                                messaggio += microphone + " ARTISTA: " + tracks.data[i].artist.name + "\n";
                                messaggio += duration + " DURATA: " + Durata(tracks.data[i].duration.toFixed(2)) + " min\n";
                                messaggio += trophy + " RANK: " + tracks.data[i].rank + "\n";
                                messaggio += link + " LINK DEEZER: <a href=\"" + tracks.data[i].link + "  \">" + tracks.data[i].title + "/Deez</a>";

                                await bot.sendMessage(msg.chat.id, "<b>" + messaggio + "</b>", {
                                    parse_mode: "HTML"
                                });

                                await bot.sendAudio(msg.chat.id, tracks.data[i].preview, { caption: "ASCOLTA LA PREVIEW DEL BRANO! " + album })

                                if (i != 4)
                                    await bot.sendMessage(msg.chat.id, guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar);
                            }

                        }
                    });
                })
            })
        })
    })

});

//FIND TRACK ITUNES
bot.onText(/\/findtrackitunes/, (msg, match) => {

    var nome = "";
    var limite;
    bot.sendMessage(msg.chat.id, "Quale canzone vuoi cercare con ITunes?").then(playload => {
        bot.once('message', (msg) => {
            nome = msg.text;
            bot.sendMessage(msg.chat.id, "Quanti risultati vuoi visualizzare?").then(playload => {
                bot.once('message', (msg) => {
                    limite = msg.text;
                    itunes.track(nome, { limit: limite, lang: 'it', country: 'IT' }).then(async function(tracks) {
                        console.log(tracks);
                        if (tracks.resultCount == 0) {
                            await bot.sendMessage(msg.chat.id, "<b>Non è stata trovata nessuna canzone con il titolo " + track_nome + "</b>", {
                                parse_mode: "HTML"
                            });
                        } else {
                            for (let i = 0; i < limite; i++) {

                                let messaggio = "";

                                messaggio += canzone + " CANZONE: " + tracks.results[i].trackName + "\n";
                                messaggio += album + " ALBUM: " + tracks.results[i].collectionName + "\n";
                                messaggio += microphone + " ARTISTA: " + tracks.results[i].artistName + "\n";
                                messaggio += genre + " GENERE: " + tracks.results[i].primaryGenreName + "\n";

                                let data = "";
                                data = tracks.results[i].releaseDate;
                                data = data.substr(0, 10);
                                let y = data.split("-")[0];
                                let m = data.split("-")[1];
                                let d = data.split("-")[2];

                                messaggio += date + " DATA RELEASE: " + d + "/" + m + "/" + y + "\n";
                                messaggio += genre + " GENERE: " + tracks.results[i].primaryGenreName + "\n";
                                messaggio += money + " PREZZO ITUNES: " + tracks.results[i].trackPrice + " €\n";
                                messaggio += link + " LINK ITUNES: <a href=\"" + tracks.results[i].trackViewUrl + "  \">" + tracks.results[i].trackName + "/Itunes</a>";

                                await bot.sendMessage(msg.chat.id, "<b>" + messaggio + "</b>", {
                                    parse_mode: "HTML"
                                });

                                await bot.sendAudio(msg.chat.id, tracks.results[i].previewUrl, { caption: "ASCOLTA LA PREVIEW DEL BRANO " + album })

                                if (i != 4)
                                    await bot.sendMessage(msg.chat.id, guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar + medal + guitar);
                            }
                        }
                    });
                })
            })
        })
    })

});

//TOPTEN TRACK
bot.onText(/\/toptentracks/, (msg, match) => {
    deezer.chart.tracks().then(async function(chart) {
        messaggio = trophy + " TOP TEN CANZONI: ";
        await bot.sendMessage(msg.chat.id, "<b>" + messaggio + "</b>", {
            parse_mode: "HTML"
        });

        for (let i = 0; i < chart.total; i++) {

            let messaggio_canzoni = "";
            if (i == 0)
                messaggio_canzoni += one + " N°" + chart.data[i].position + ":\n";
            else if (i == 1)
                messaggio_canzoni += sec + " N°" + chart.data[i].position + ":\n";
            else if (i == 2)
                messaggio_canzoni += th + " N°" + chart.data[i].position + ":\n";
            else
                messaggio_canzoni += md_s + " N°" + chart.data[i].position + "\n";

            messaggio_canzoni += canzone + " TITOLO: " + chart.data[i].title + "\n";
            messaggio_canzoni += microphone + " ARTISTA: " + chart.data[i].artist.name + "\n";
            messaggio_canzoni += duration + "DURATA: " + Durata(chart.data[i].duration.toFixed(2)) + " min\n";
            messaggio_canzoni += link + " LINK DEEZER: " + "<a href=\"" + chart.data[i].link + "\">" + chart.data[i].title + "</a>";

            await bot.sendMessage(msg.chat.id, "<b>" + messaggio_canzoni + "</b>", {
                parse_mode: "HTML"
            });

            await bot.sendAudio(msg.chat.id, chart.data[i].preview, { caption: "ASCOLTA LA PREVIEW DEL BRANO " + album });
            if (i != 9)
                await bot.sendMessage(msg.chat.id, music + medal + music + medal + music + medal + music + medal + music + medal + music + medal + music);
        }

        console.log(chart);
    });
});

//SITO
app.get("/", function(req, res) {
    res.render("index");
})

app.get("/TopTenAlbum", function(req, res) {
    deezer.chart.albums().then(function(chart) {
        console.log(chart.data[0].artist);
        res.render("TopTenAlbum", { topten: chart.data });
    }).catch(function(err) {
        console.log(err);
        res.render("Err", { canzoni: "errore" });
    })

})

app.get("/FindArtist", function(req, res) {
    res.render("FindArtist");
})

app.get("/FindPlaylist", function(req, res) {
    res.render("FindPlaylist");
})

app.get("/FindPlaylist", function(req, res) {

    deezer.search.playlist('Hits', function(playlist) {
        res.render("FindPlaylist", { playlist: playlist.data });
    });

})

app.get("/FindTrack", function(req, res) {
    res.render("FindTrack");
})


app.post("/FindArtist", async function(req, res) {
    let artista = req.body.artista;
    let value = req.body.gridRadios;
    var dati_artista = [];
    if (value == "option1") {
        deezer.search.artist(artista, 1, 1).then(function(artista) {

            dati_artista.push(artista.data);
            deezer.artist.top(artista.data[0].id).then(function(topsong) {

                dati_artista[1] = topsong.data;
                deezer.artist.albums(artista.data[0].id).then(function(albums) {

                    dati_artista[2] = albums.data;
                    res.render('FoundArtist', { artista: dati_artista });

                }).catch(function(err) {
                    console.log(err);
                    res.render("Err", { canzoni: "errore" });
                })

            });
        }).catch(function(err) {
            console.log(err);
            res.render("Err", { canzoni: "errore" });
        })
    } else {
        itunes.artist(artista, { limit: 30, lang: 'it', country: 'IT' }).then(function(artisti) {
            dati_artista[0] = "itunes";
            dati_artista[1] = artisti.results;
            res.render('FoundArtist', { artista: dati_artista });
        }).catch(function(err) {
            console.log(err);
            res.render("Err", { canzoni: "errore" });
        })

    }
});

app.post("/FindPlaylist", function(req, res) {
    var playlist = req.body.playlist;
    //var dati_canzone = [];
    deezer.search.playlist(playlist).then(function(playlists) {
        res.render("FoundPlaylist", { playlist: playlists.data });
    }).catch(function(err) {
        console.log(err);
        res.render("Err", { canzoni: "errore" });
    })
})

app.get("/Err", function(req, res) {
    res.render("Err");
})

app.post("/FindTrack", function(req, res) {
    var canzone = req.body.canzone;
    var value = req.body.gridRadios;
    var dati_canzone = [];
    if (value == "option1") {
        deezer.search.track(canzone).then(async function(tracks) {
            res.render("FoundTrack", { canzoni: tracks.data });
        }).catch(function(err) {
            console.log(err);
            res.render("Err", { canzoni: "errore" });
        })
    } else {
        itunes.trackVideo(canzone, { limit: 30, lang: 'it', country: 'IT' }).then(function(canzoni) {
            dati_canzone[0] = "itunes";
            dati_canzone[1] = canzoni.results;
            res.render("FoundTrack", { canzoni: dati_canzone });

        }).catch(function(err) {
            console.log(err);
            res.render("Err", { canzoni: "errore" });
        })

    }


});
app.get("/toptenartist", function(req, res) {

    deezer.chart.artists().then(function(chart) {

        res.render('TopTenArtist', { topten: chart.data });

    }).catch(function(err) {
        console.log(err);
        res.render("Err", { canzoni: "errore" });
    })

})

app.get("/TopTenTrack", function(req, res) {
    deezer.chart.tracks().then(function(chart) {
        res.render('TopTenTrack', { topten: chart.data });
    }).catch(function(err) {
        console.log(err);
        res.render("Err", { canzoni: "errore" });
    })

})
bot.on("polling_error", function(err) {
    console.log(err);
});
app.listen(PORT, function() {
    console.log('Server attivo sulla porta ' + PORT);
});

function Durata(durata) {
    secondi = durata % 60;
    minuti = ((durata - secondi) / 60) % 60;
    return (minuti + ":" + secondi);
}