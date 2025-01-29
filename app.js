import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getFirestore, collection, query, orderBy, onSnapshot, serverTimestamp, getDocs, deleteDoc, setDoc, doc } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTIuVn8IBPtAHfIL5AiSPtjw1ynFnais8",
  authDomain: "scrum-poker-board-1fdfb.firebaseapp.com",
  projectId: "scrum-poker-board-1fdfb",
  storageBucket: "scrum-poker-board-1fdfb.firebasestorage.app",
  messagingSenderId: "352702822956",
  appId: "1:352702822956:web:2185599557476d68c36f89",
  measurementId: "G-JL3HC47F5Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth)
  .then(() => {
    console.log('Signed in anonymously');
  })
  .catch((error) => {
    console.error('Error signing in:', error);
  });

// DOM elements
const cards = document.querySelectorAll('.card');
const workItemInput = document.getElementById('work-item');
const workItemDisplay = document.getElementById('work-item-display');
const voteHistoryTable = document.getElementById('vote-history').getElementsByTagName('tbody')[0];
const userNameInput = document.getElementById('user-name');
const startVotingButton = document.getElementById('start-voting');
const toggleScoresButton = document.getElementById('toggle-scores');

// Variables
let currentUserName = '';
let showScores = false;

// Start voting after user enters their name
startVotingButton.addEventListener('click', () => {
  currentUserName = userNameInput.value.trim();
  if (!currentUserName) {
    alert("Please enter a name.");
    return;
  }
  alert(`Welcome ${currentUserName}! You can now vote.`);
  startVotingButton.style.display = 'none';
  toggleScoresButton.style.display = 'inline';
});

// Handle card clicks (voting)
cards.forEach(card => {
  card.addEventListener('click', async () => {
    if (!currentUserName) {
      alert("Please enter your name first.");
      return;
    }

    const voteValue = card.getAttribute('data-value');
    const workItemId = workItemInput.value.trim();

    if (!workItemId) {
      alert("Please enter a work item ID.");
      return;
    }

    workItemDisplay.textContent = workItemId;

    try {
      const voteRef = doc(db, 'CLVotes', `${currentUserName}_${workItemId}`);
      await setDoc(voteRef, {
        workItemId: workItemId,
        vote: voteValue,
        user: currentUserName,
        timestamp: serverTimestamp()
      });
      console.log("Vote updated in Firestore.");
    } catch (error) {
      console.error("Error updating vote: ", error);
    }
  });
});

// Real-time listener for votes
const votesQuery = query(collection(db, 'CLVotes'), orderBy('timestamp'));
onSnapshot(votesQuery, snapshot => {
  renderVoteHistory(snapshot);
});

function renderVoteHistory(snapshot) {
  voteHistoryTable.innerHTML = '';
  snapshot.forEach(doc => {
    const voteData = doc.data();
    const row = document.createElement('tr');

    const workItemCell = document.createElement('td');
    const nameCell = document.createElement('td');
    const voteCell = document.createElement('td');

    workItemCell.textContent = voteData.workItemId;
    nameCell.textContent = voteData.user;
    voteCell.textContent = showScores ? voteData.vote : 'Hidden';

    row.appendChild(workItemCell);
    row.appendChild(nameCell);
    row.appendChild(voteCell);
    voteHistoryTable.appendChild(row);
  });
}

toggleScoresButton.addEventListener('click', () => {
  showScores = !showScores;
  toggleScoresButton.textContent = showScores ? 'Hide Scores' : 'Show Scores';
});

async function clearVotes() {
  try {
    const votesSnapshot = await getDocs(collection(db, 'CLVotes'));
    votesSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    console.log("All votes cleared from Firestore.");
  } catch (error) {
    console.error("Error clearing votes: ", error);
  }
}

document.getElementById('clear-votes').addEventListener('click', clearVotes);

async function loadWinners() {
  try {
    const querySnapshot = await getDocs(query(collection(db, 'CLWINNERS'), orderBy('timestamp')));
    querySnapshot.forEach((doc) => {
      const winner = doc.data();
      addWinnerToTable(winner.date, winner.workItem, winner.score);
    });
  } catch (e) {
    console.error('Error loading winners:', e);
  }
}

loadWinners();

    // Show or hide votes based on showScores
    voteCell.textContent = showScores ? voteData.vote : 'Hidden';

    row.appendChild(workItemCell);
    row.appendChild(nameCell);
    row.appendChild(voteCell);
    voteHistoryTable.appendChild(row);
  });
}

// Toggle score visibility
toggleScoresButton.addEventListener('click', () => {
  showScores = !showScores;
  toggleScoresButton.textContent = showScores ? 'Hide Scores' : 'Show Scores';
