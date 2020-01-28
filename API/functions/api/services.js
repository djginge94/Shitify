const request = require('request')
const Base64 = require('js-base64').Base64

// AUTH
const spotifyAuthUrl = 'https://accounts.spotify.com/api/token'
const clientId = 'b5f5991988bd49a3b9e21ee41f4de0ae'
const clientSecret = '8059eeec51cd4d1192636356bf1028f7'

exports.fetchToken = () => new Promise((resolve, reject) => {
    const options = {
        url: spotifyAuthUrl,
        headers: { 'Authorization': `Basic ${encode(clientId, clientSecret)}` },
        form: { grant_type: 'client_credentials' },
        json: true
    }

    request.post(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            resolve(body.access_token)
        } else {
            reject(error)
        }
    })
})

function encode(id, secret) {
    return Base64.encode(`${id}:${secret}`)
}


// SEARCH
const spotifySearchUrl = 'https://api.spotify.com/v1/search'
exports.searchForArtist = (query, token) => new Promise((resolve, reject) => {
    const options = {
        url: `${spotifySearchUrl}?query=${query}&type=artist`,
        headers: { 'Authorization': `Bearer ${token}`},
        json: true
    }

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const artistId = body.artists.items[0].id
            resolve(artistId)
        } else {
            reject(error)
        }
    })
})

// GET ALBUM IDS FOR ARTIST
exports.getAlbumIds = (artistId, token) => new Promise((resolve, reject) => {
    const spotifyAlbumsForArtistUrl = getAlbumIdEndpoint(artistId)

    const options = {
        url: `${spotifyAlbumsForArtistUrl}`,
        headers: { 'Authorization': `Bearer ${token}`},
        json: true
    }

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const albumIds = body.items.map((album) => { return album.id })
            resolve(albumIds)
        } else {
            reject(error)
        }
    })
})

function getAlbumIdEndpoint(id) {
    return `https://api.spotify.com/v1/artists/${id}/albums`
}

// GET LEAST POPULAR ALBUM
const spotifyMultipleAlbumsUrl = 'https://api.spotify.com/v1/albums/'
exports.leastPopularAlbum = (albumIds, token) => new Promise((resolve, reject) => {
    const query = albumIds.join(",")
    const options = {
        url: `${spotifyMultipleAlbumsUrl}?ids=${query}&type=album`,
        headers: { 'Authorization': `Bearer ${token}`},
        json: true
    }

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const leastPopularAlbum = body.albums.filter($0 => $0.album_type === "album")
                                                 .map($0 => { return { id: $0.id, popularity: $0.popularity } })
                                                 .sort(($0, $1) => { return $0.popularity - $1.popularity })
            resolve(leastPopularAlbum[0].id)
        } else {
            reject(error)
        }
    })
})

// GET TRACK IDS FOR ALBUM
exports.getTrackIds = (albumId, token) => new Promise((resolve, reject) => {
    const options = {
        url: `https://api.spotify.com/v1/albums/${albumId}/tracks`,
        headers: { 'Authorization': `Bearer ${token}`},
        json: true
    }

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const trackIds = body.items.map((track) => { return track.id })
            resolve(trackIds)
        } else {
            reject(error)
        }
    })
})

// GET LEAST POPULAR TRACK
const spotifyMultipleTracksUrl = 'https://api.spotify.com/v1/tracks'
exports.leastPopularTrack = (trackIds, token) => new Promise((resolve, reject) => {
    const query = trackIds.join(",")
    const options = {
        url: `${spotifyMultipleTracksUrl}?ids=${query}`,
        headers: { 'Authorization': `Bearer ${token}`},
        json: true
    }

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const sortedTracks = body.tracks.sort(($0, $1) => { return $0.popularity - $1.popularity })
            resolve(sortedTracks[0])
        } else {
            reject(error)
        }
    })
})