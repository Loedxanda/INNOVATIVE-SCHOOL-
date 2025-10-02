# Mobile Application Development Guide for Innovative School Platform

This guide provides comprehensive instructions for developing native mobile applications (iOS and Android) for the Innovative School Platform, leveraging the existing API infrastructure and design system.

## Overview

The Innovative School Platform is designed with a mobile-first responsive web interface that works well on mobile browsers. However, native mobile applications can provide enhanced user experience, offline capabilities, and access to device-specific features.

This guide outlines two approaches:
1. **Progressive Web App (PWA)** - Enhanced web experience that works offline
2. **Native Mobile Apps** - Fully native applications for iOS and Android

## Approach 1: Progressive Web App (PWA)

### Benefits
- Single codebase (web-based)
- Works offline with service workers
- Installable on device home screen
- Push notifications support
- Lower development cost

### Implementation Steps

1. **Enable PWA Features in React App**
```bash
# Install PWA dependencies
cd frontend
npm install workbox-webpack-plugin workbox-background-sync
```

2. **Update index.html for PWA**
```html
<!-- Add to public/index.html -->
<meta name="theme-color" content="#4A0000">
<link rel="manifest" href="%PUBLIC_URL%/manifest.json">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Innovative School">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
```

3. **Create Manifest File**
```json
{
  "short_name": "School App",
  "name": "Innovative School Platform",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#4A0000",
  "background_color": "#001F3F"
}
```

4. **Implement Service Worker**
```javascript
// src/serviceWorker.js
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('This web app is being served cache-first by a service worker.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.');
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Content is cached for offline use.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
```

5. **Add Offline Support**
```javascript
// src/utils/offlineManager.js
class OfflineManager {
  constructor() {
    this.dbName = 'InnovativeSchoolOffline';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('resources')) {
          db.createObjectStore('resources', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('inquiries')) {
          db.createObjectStore('inquiries', { keyPath: 'id' });
        }
      };
    });
  }

  async saveResource(resource) {
    const transaction = this.db.transaction(['resources'], 'readwrite');
    const store = transaction.objectStore('resources');
    return store.put(resource);
  }

  async getResources() {
    const transaction = this.db.transaction(['resources'], 'readonly');
    const store = transaction.objectStore('resources');
    return store.getAll();
  }
}

export default new OfflineManager();
```

## Approach 2: Native Mobile Applications

### Technology Stack
- **React Native** for cross-platform development
- **Redux** or **Context API** for state management
- **React Navigation** for navigation
- **Native Modules** for device-specific features

### Project Setup

1. **Install React Native CLI**
```bash
npm install -g react-native-cli
# Or use Expo for easier setup
npm install -g expo-cli
```

2. **Create Mobile Project**
```bash
# Using React Native CLI
npx react-native init InnovativeSchoolMobile
cd InnovativeSchoolMobile

# Or using Expo (recommended for faster development)
expo init innovative-school-mobile
cd innovative-school-mobile
```

3. **Install Dependencies**
```bash
# Core dependencies
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated
npm install @react-native-async-storage/async-storage
npm install axios
npm install @react-native-community/netinfo
npm install react-native-push-notification

# UI Components
npm install react-native-paper
npm install react-native-vector-icons

# For iOS
cd ios && pod install && cd ..
```

### Project Structure

```
innovative-school-mobile/
├── src/
│   ├── components/
│   │   ├── ResourceCard.js
│   │   ├── MessageItem.js
│   │   ├── InquiryCard.js
│   │   └── AIChatBubble.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── ResourceHubScreen.js
│   │   ├── MessagingScreen.js
│   │   ├── AIScreen.js
│   │   ├── InquiryScreen.js
│   │   └── ProfileScreen.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── resourceService.js
│   │   ├── messagingService.js
│   │   ├── aiService.js
│   │   └── inquiryService.js
│   ├── utils/
│   │   ├── offlineManager.js
│   │   ├── pushNotifications.js
│   │   └── helpers.js
│   ├── store/
│   │   ├── index.js
│   │   ├── authSlice.js
│   │   ├── resourceSlice.js
│   │   ├── messageSlice.js
│   │   └── aiSlice.js
│   └── theme/
│       └── index.js
├── assets/
│   ├── images/
│   └── icons/
└── App.js
```

### Core Implementation

1. **Theme Configuration**
```javascript
// src/theme/index.js
export const colors = {
  oxblood: '#4A0000',
  oxbloodLight: '#7A3030',
  oxbloodDark: '#1A0000',
  deepBlue: '#001F3F',
  deepBlueLight: '#334A66',
  deepBlueDark: '#000A1A',
  lightBlue: '#7FDBFF',
  lightBlueLight: '#B2E9FF',
  lightBlueDark: '#4BA8CC',
  offWhite: '#F5F5F5',
  white: '#FFFFFF',
  offWhiteDark: '#C2C2C2',
};

export const theme = {
  dark: true,
  colors: {
    primary: colors.oxblood,
    background: colors.deepBlue,
    card: colors.deepBlueLight,
    text: colors.offWhite,
    border: colors.lightBlue,
    notification: colors.oxblood,
  },
};

export const gradients = {
  primary: ['#4A0000', '#001F3F'],
  secondary: ['#001F3F', '#4A0000'],
};
```

2. **API Service Integration**
```javascript
// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://your-production-api-url/api';
const AI_API_URL = 'http://your-production-ai-url/api/ai';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL, AI_API_URL };
```

3. **Authentication Service**
```javascript
// src/services/authService.js
import api, { API_BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    await AsyncStorage.setItem('token', response.data.access_token);
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('token');
  },

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};
```

4. **Resource Service**
```javascript
// src/services/resourceService.js
import api from './api';

export const resourceService = {
  async getResources(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/resources/?${queryParams.toString()}`);
    return response.data;
  },

  async getResource(resourceId) {
    const response = await api.get(`/resources/${resourceId}`);
    return response.data;
  },

  async createResource(resourceData) {
    const response = await api.post('/resources/', resourceData);
    return response.data;
  },

  async rateResource(resourceId, rating) {
    const response = await api.post(`/resources/${resourceId}/ratings`, {
      resource_id: resourceId,
      rating,
    });
    return response.data;
  },

  async commentOnResource(resourceId, comment) {
    const response = await api.post(`/resources/${resourceId}/comments`, {
      resource_id: resourceId,
      comment,
    });
    return response.data;
  },
};
```

5. **Main App Navigation**
```javascript
// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './src/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ResourceHubScreen from './src/screens/ResourceHubScreen';
import MessagingScreen from './src/screens/MessagingScreen';
import AIScreen from './src/screens/AIScreen';
import InquiryScreen from './src/screens/InquiryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Show splash screen
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isLoggedIn ? 'Dashboard' : 'Login'}
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {isLoggedIn ? (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="ResourceHub" component={ResourceHubScreen} />
              <Stack.Screen name="Messaging" component={MessagingScreen} />
              <Stack.Screen name="AI Assistant" component={AIScreen} />
              <Stack.Screen name="Inquiries" component={InquiryScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </>
          ) : (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
```

6. **Dashboard Screen Example**
```javascript
// src/screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { resourceService, messagingService } from '../services';

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    resources: 0,
    unreadMessages: 0,
    inquiries: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load resource count
      const resources = await resourceService.getResources();
      
      // Load unread message count
      const unreadCount = await messagingService.getUnreadMessagesCount();
      
      setStats({
        resources: resources.length,
        unreadMessages: unreadCount,
        inquiries: 0, // Load from inquiry service
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#4A0000', '#001F3F']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back!</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{stats.resources}</Title>
            <Paragraph>Resources</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{stats.unreadMessages}</Title>
            <Paragraph>Unread Messages</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{stats.inquiries}</Title>
            <Paragraph>Inquiries</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ResourceHub')}
        >
          <Text style={styles.actionButtonText}>Resource Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Messaging')}
        >
          <Text style={styles.actionButtonText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AI Assistant')}
        >
          <Text style={styles.actionButtonText}>Ask AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Inquiries')}
        >
          <Text style={styles.actionButtonText}>Inquiries</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F3F',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5F5F5',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7FDBFF',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: 'rgba(0, 31, 63, 0.7)',
    borderColor: 'rgba(127, 219, 255, 0.2)',
    borderWidth: 1,
    width: 100,
  },
  quickActions: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#4A0000',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DashboardScreen;
```

### Device-Specific Features

1. **Push Notifications**
```javascript
// src/utils/pushNotifications.js
import PushNotification from 'react-native-push-notification';

export const configurePushNotifications = () => {
  PushNotification.configure({
    onRegister: function (token) {
      console.log('TOKEN:', token);
    },

    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
    },

    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    popInitialNotification: true,
    requestPermissions: true,
  });
};

export const showLocalNotification = (title, message) => {
  PushNotification.localNotification({
    title: title,
    message: message,
  });
};
```

2. **Camera Integration**
```javascript
// src/components/ImagePicker.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const ImagePicker = ({ onImageSelected }) => {
  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        console.log('User cancelled image picker');
      } else {
        onImageSelected(response.assets[0]);
      }
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={selectImage}>
      <Text style={styles.buttonText}>Select Image</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4A0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F5F5F5',
    fontWeight: '500',
  },
});

export default ImagePicker;
```

3. **Biometric Authentication**
```javascript
// src/utils/biometrics.js
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authenticateWithBiometrics = async () => {
  try {
    const biometryType = await TouchID.isSupported();
    if (biometryType) {
      const success = await TouchID.authenticate('Authenticate to access the app');
      return success;
    }
    return false;
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return false;
  }
};

export const enableBiometricLogin = async () => {
  try {
    const success = await authenticateWithBiometrics();
    if (success) {
      await AsyncStorage.setItem('biometricEnabled', 'true');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to enable biometric login:', error);
    return false;
  }
};
```

### Testing and Deployment

1. **Testing**
```bash
# Run on iOS simulator
npx react-native run-ios

# Run on Android emulator
npx react-native run-android

# Using Expo
expo start
```

2. **Building for Production**

For iOS:
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Build for iOS
npx react-native run-ios --configuration Release
```

For Android:
```bash
# Generate signed APK
cd android
./gradlew assembleRelease
```

3. **App Store Deployment**

For iOS:
- Create Apple Developer account
- Set up App Store Connect
- Configure provisioning profiles
- Archive and upload through Xcode

For Android:
- Create Google Play Developer account
- Generate signed APK/AAB
- Upload to Google Play Console

### Performance Optimization

1. **Bundle Optimization**
```javascript
// metro.config.js
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

2. **Image Optimization**
```javascript
// Use react-native-fast-image for better image loading
import FastImage from 'react-native-fast-image';

<FastImage
  style={styles.image}
  source={{
    uri: 'https://example.com/image.jpg',
    priority: FastImage.priority.normal,
  }}
  resizeMode={FastImage.resizeMode.contain}
/>
```

3. **Memory Management**
```javascript
// Implement proper cleanup in components
useEffect(() => {
  return () => {
    // Cleanup subscriptions, timers, etc.
  };
}, []);
```

## Conclusion

This guide provides a comprehensive approach to developing mobile applications for the Innovative School Platform. The PWA approach offers a quick solution with minimal development effort, while native mobile applications provide the best user experience with access to device-specific features.

Choose the approach that best fits your timeline, budget, and user experience requirements. Both approaches can leverage the existing API infrastructure and design system to ensure consistency across platforms.