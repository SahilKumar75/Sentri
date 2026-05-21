import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

// Initialize Google Sign-In (You will need to configure the webClientId from your google-services.json later)
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Replace with your web client ID from Firebase console later
});

export const firebaseAuth = auth();

export async function signInWithGoogle() {
  try {
    // Check if your device supports Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();
    
    // Try the new style of result first, then fallback to old style if it exists
    let idToken = signInResult.data?.idToken;
    if (!idToken && signInResult.idToken) {
      idToken = signInResult.idToken;
    }

    if (!idToken) {
      throw new Error('No ID token found');
    }

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return await auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signInWithApple() {
  try {
    const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { identityToken, nonce } = appleAuthRequestResponse;

    if (!identityToken) {
      throw new Error('No identity token provided by Apple');
    }

    // Create a Firebase credential from the Apple response
    const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

    // Sign in with Firebase
    return await auth().signInWithCredential(appleCredential);
  } catch (e) {
    if (e.code === 'ERR_REQUEST_CANCELED') {
      // Handle user cancellation
      console.log('User canceled Apple Sign-In');
    } else {
      console.error('Apple Sign-In Error:', e);
      throw e;
    }
  }
}
