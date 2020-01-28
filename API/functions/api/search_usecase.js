const service = require('./services')

exports.search = (artist) => new Promise((resolve, reject) => {
    service.fetchToken().then((response) => {
        return response
    })
    .then((token) => {
        console.log(artist, 'artist');
        const artistId = service.searchForArtist(artist, token)
        console.log(artistId, 'artistId');
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
        console.log(leastPopularTrack.name, 'track');
        resolve(leastPopularTrack.name)
    })
    .catch((error) => {
        reject()
        // return this.emit(':tell', this.t('ERROR_MESSAGE'));
    })
})