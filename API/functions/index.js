const functions = require("firebase-functions")
const express = require('express')
const service = require('./api/services')

const app = express()

app.get('/:artist', (req, res) => {
    return service.fetchToken()
    .then((response) => {
        return response
    })
    .then((token) => {
        const artistId = service.searchForArtist(req.params.artist, token)
        return Promise.all([artistId, token])
    })
    .then(([artistId, token]) => {
        const albumIds = service.getAlbumIds(artistId, token)
        return Promise.all([albumIds, token])
    })
    .then(([albumIds, token]) => {
        const albumId = service.leastPopularAlbum(albumIds, token)
        return Promise.all([albumId, token])
    })
    .then(([albumId, token]) => {
        const trackIds = service.getTrackIds(albumId, token)
        return Promise.all([trackIds, token])
    })
    .then(([trackIds, token]) => {
        const leastPopularTrack = service.leastPopularTrack(trackIds, token)
        return leastPopularTrack
    })
    .then((leastPopularTrack) => {
        res.status(200).send(leastPopularTrack)
    })
    .catch((error) => {
        console.log(`Error: ${error}`)
    })
    .finally(() => {
        res.end()
    })
})

const leastPopular = functions.https.onRequest(app)

module.exports = {
    leastPopular
}