// dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {Switch, Route, Link} from 'react-router-dom';
// sub components
import Lyrics from './Lyrics.jsx';
import Mood from './Mood.jsx';
import Player from './Player.jsx';
import Search from './Search.jsx';
import Header from './Header.jsx';
import Stats from './Stats.jsx';
import SearchResults from './SearchResults.jsx';
import User from './User.jsx';
import LoginSignup from './LoginSignup.jsx';
import PastSearchResults from './PastSearchResults.jsx';
import TweetResults from './TweetResults.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSongNameAndArtist: [],
      currentLyrics: '',
      watson: {},
      spotifyURI: null,
      lyricsLang: 'en',
      lyricsEnglish: '',
      artistEnglish: '',
      titleEnglish: '',
      searchResults: [],
      searchResultsUser: [],
      searchResultsLoading: false,
      spotifyLoading: false,
      lyricsLoading: false,
      showPlayer: false,
      showLyrics: false,
      showMood: false,
      showResults: false,
      showResultsUser: false,
      showStats: false,
      showPrev: false,
      upDown: true,
      url: window.location.href,
      loggedIn: false,
      upDownUser: false,
      searchResultsLoadingUser: false,
      userStatsInfo: {
        username: '',
        listenedSongsList: [],
        totalSongsListened: 0,
      },
      showTweets: false,

    };
    this.search = this.search.bind(this);
    this.process = this.process.bind(this);
    this.searchTweets = this.searchTweets.bind(this);
    this.showResults = this.showResults.bind(this);
    this.upDown = this.upDown.bind(this);
    this.upDownUser = this.upDownUser.bind(this);
    this.showResultsUser = this.showResultsUser.bind(this);
    this.loadPastSearchResults = this.loadPastSearchResults.bind(this);
    this.showUserStats = this.showUserStats.bind(this);
    this.updateUserStats = this.updateUserStats.bind(this);
  }

  search(title, artist) {
    this.setState({showResults: true, searchResultsLoading: true, showPrev: true, upDown: false});

    let options = {
      title: title,
      artist: artist
    };
    axios.post('/search', options).then((res) => {
      if (!res.data) {
        console.log('error');
      }
      this.setState({searchResults: res.data, searchResultsLoading: false});
    });
  }

  process(trackObj) {
    this.setState({
      showPlayer: true,
      spotifyLoading: true,
      lyricsLoading: true,
      showResults: false,
      showResultsUser: false,
      upDownUser: false,
      showLyrics: false,
      showMood: false,
      upDown: true,
      showTweets: true,
    });

    let input = {};
    input.track_id = trackObj.track_id;
    input.track_name = trackObj.track_name;
    input.artist_name = trackObj.artist_name;
    input.album_coverart_100x100 = trackObj.album_coverart_100x100;
    input.album_coverart_350x350 = trackObj.album_coverart_350x350;
    input.album_coverart_500x500 = trackObj.album_coverart_500x500;
    input.album_coverart_800x800 = trackObj.album_coverart_800x800;

    axios.post('/process', input).then(res => {
      let data = res.data;
      this.setState({
        currentSongNameAndArtist: data[0],
        currentLyrics: data[1],
        watson: data[2],
        spotifyURI: data[3],
        lyricsLang: data[4],
        lyricsEnglish: data[5],
        artistEnglish: data[6],
        titleEnglish: data[7],
        spotifyLoading: false,
        lyricsLoading: false,
        showLyrics: true,
        showMood: true
      });     
    }).catch(error => {
      throw error;
    });  
  }

  searchTweets(trackAlbumArtist) {
    console.log("from App Search Tweets")
    axios.get('/searchTweets', {
      params: {
        ArtistHashTag: trackAlbumArtist
      }
    })
    .then((res) => {
      if (!res.data) {
        console.log('error');
      }
      console.log(res.data.statuses);
      this.setState({tweets: res.data.statuses});
    });

  }

  showResults() {
    this.setState({
      showResults: !this.state.showResults,
      showTweets: !this.state.showTweets,
    });
    console.log(this.state.showTweets);
  }

  showResultsUser() {
    this.setState({
      showResultsUser: !this.state.showResultsUser
    });
  }

  upDown() {
    this.setState({
      upDown: !this.state.upDown
    });
  }

  upDownUser() {
    this.setState({
      upDownUser: !this.state.upDownUser
    });
  }

  showUserStats() {
    this.setState({
      showStats: !this.state.showStats
    });
  }


  updateUserStats(userInfo) {
    this.setState({
      userStatsInfo: {
        username: userInfo.data.username,
        listenedSongsList: userInfo.data.listenedSongsList,
        totalSongsListened: userInfo.data.totalSongsListened,
      }
    });
  }

  loadPastSearchResults(trackId) {
    axios.post('/loadPastSearchResults', {track_id: trackId}).then(res => {
      let songData = res.data[0];
      let watsonData = res.data[1];
      console.log(watsonData);
      this.setState({
        currentLyrics: songData.lyrics,
        currentSongNameAndArtist: [
          songData.track_name, songData.artist_name
        ],
        watson: watsonData,
        spotifyURI: songData.spotify_uri,
        showMood: true,
        showPlayer: true,
        showLyrics: true
      });
    }).catch(err => console.log(err));
  }

  render() {
    return (
      <div>
        <Header url={this.state.url}/>
        <div className="container">
          <div className="col1">
            <Search
              search={this.search}
              prev={this.showResults}
              showPrev={this.state.showPrev}
              upDown={this.state.upDown}
              runUpDown={this.upDown}
            />
            {this.state.showResults
              ? <SearchResults
                  results={this.state.searchResults}
                  process={this.process}
                  searchResultsLoading={this.state.searchResultsLoading}
                />
              : null
            }
            {this.state.showPlayer
              ? <Lyrics
                  showPlayer={this.state.showPlayer}
                  spotifyURI={this.state.spotifyURI}
                  loading={this.state.spotifyLoading}
                  lyrics={this.state.currentLyrics}
                  loading={this.state.lyricsLoading}
                  songNameAndArtist={this.state.currentSongNameAndArtist}
                  lyricsLang={this.state.lyricsLang}
                  lyricsEnglish={this.state.lyricsEnglish}
                  artistEnglish={this.state.artistEnglish}
                  titleEnglish={this.state.titleEnglish}
                />
              : null
            }    
          </div>
          <div className="col1">
            {this.state.showTweets
              ? <TweetResults 
                  loading={this.state.spotifyLoading} 
                  songNameAndArtist={this.state.currentSongNameAndArtist}
                /> 
              : null
            }
          </div>
          <div className="col2">
            <User
              showPrev={this.state.showResultsUser}
              prev={this.showResultsUser}
              upDown={this.state.upDownUser}
              runUpDown={this.upDownUser}
              process={this.process}
              searchResultsLoading={this.state.searchResultsLoadingUser}
              loadPastSearchResults={this.loadPastSearchResults}
              showUserStats={this.showUserStats}
              showStats={this.state.showStats}
              updateUserStats={this.updateUserStats}
            />
            {this.state.showMood
              ? <Mood
                  watson={this.state.watson}
                  songNameAndArtist={this.state.currentSongNameAndArtist}
                />
              : null
            }
            {this.state.showStats ?
              <Stats
                userStatsInfo={this.state.userStatsInfo}
              /> : null
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
