// app/Welcome.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../contexts/AuthProvider';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const welcomeLottieRef = useRef<LottieView>(null);
  const grassLottieRef = useRef<LottieView>(null);
  const handshakingLottieRef = useRef<LottieView>(null);

  const [showMomentumText, setShowMomentumText] = useState(false);
  const [showEnterButton, setShowEnterButton] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const grassOpacityAnim = useRef(new Animated.Value(0)).current;
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const handshakingOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // New animation values for exit sequence
  const welcomeCenterAnim = useRef(new Animated.Value(0)).current; // 0 = original position, 1 = center
  const welcomeScaleExitAnim = useRef(new Animated.Value(1)).current; // Scale for welcome lottie
  const pageOpacityAnim = useRef(new Animated.Value(1)).current; // For page fade out

  useEffect(() => {
    // Hide status bar for immersive experience
    StatusBar.setHidden(true);

    // Start background animations
    Animated.parallel([
      // Handshaking animation fade in
      Animated.timing(handshakingOpacityAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Grass illustration fade in
      Animated.timing(grassOpacityAnim, {
        toValue: 0.3,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Background color transition
      Animated.timing(backgroundColorAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
      // Sparkle animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    ]).start();

    // Start the welcome animation
    if (welcomeLottieRef.current) {
      welcomeLottieRef.current.play(0, 300); // Play until frame 300 (pause point)

      // Scale in animation for welcome Lottie
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // After the welcome text is written (at 300 frames), show momentum text
      const timer = setTimeout(() => {
        setShowMomentumText(true);

        // Fade in the momentum text with spring animation
        Animated.spring(fadeAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start(() => {
          // Show enter button after momentum text appears
          setShowEnterButton(true);
          Animated.spring(buttonFadeAnim, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }).start();
        });
      }, 3000); // Adjust timing based on your animation duration to reach frame 300

      return () => {
        clearTimeout(timer);
        StatusBar.setHidden(false);
      };
    }
  }, [fadeAnim, buttonFadeAnim, scaleAnim, grassOpacityAnim, backgroundColorAnim, sparkleAnim, handshakingOpacityAnim, welcomeCenterAnim, welcomeScaleExitAnim, pageOpacityAnim]);

  const handleEnterPress = async () => {
    // Mark welcome as seen for this user
    if (user) {
      try {
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            welcome_seen: true
          }
        });
      } catch (error) {
        console.error('Error updating user metadata:', error);
      }
    }

    // Step 1: Fade out "to Momentum" text, handshake, and enter button smoothly
    Animated.parallel([
      // Fade out momentum text
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Fade out handshake
      Animated.timing(handshakingOpacityAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Fade out enter button
      Animated.timing(buttonFadeAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Step 2: Move welcome lottie to center and scale it bigger
      Animated.parallel([
        // Move to center - smooth with momentum
        Animated.timing(welcomeCenterAnim, {
          toValue: 1,
          duration: 800, // Smooth 800ms animation
          easing: Easing.out(Easing.cubic), // Momentum-like easing (starts fast, slows down)
          useNativeDriver: true,
        }),
        // Scale bigger - smooth with momentum
        Animated.timing(welcomeScaleExitAnim, {
          toValue: 1.15, // Make it bigger
          duration: 800, // Same duration for synchronized movement
          easing: Easing.out(Easing.cubic), // Momentum-like easing
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Step 3: Play the rest of the welcome animation (erase text)
        if (welcomeLottieRef.current) {
          welcomeLottieRef.current.play(301, 493); // Play from frame 301 to end
          
          // Wait for animation to complete, then go directly to onboarding
          setTimeout(() => {
            // Navigate directly to onboarding - no fade transition
            router.replace('/Onboarding');
          }, 2800); // Wait for animation to complete
        }
      });
    });
  };

  // Animated background color
  const animatedBackgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ccd5ae', '#a3b18a'] // Gradient from light to slightly darker
  });

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ translateX: slideAnim }],
        backgroundColor: animatedBackgroundColor,
      }}
    >
      {/* Gradient Background */}
      <LinearGradient
        colors={['#fefae0', '#ccd5ae', '#a3b18a']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Grass Background Illustration */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: -50,
          left: -50,
          right: -50,
          height: height * 0.4,
          opacity: grassOpacityAnim,
        }}
      >
        <LottieView
          ref={grassLottieRef}
          source={require('../assets/lottie/grass-illus.json')}
          autoPlay
          loop
          style={{
            width: width + 100,
            height: height * 0.4,
          }}
        />
      </Animated.View>

      {/* Sparkle Effects */}
      <Animated.View
        style={{
          position: 'absolute',
          top: height * 0.1,
          right: width * 0.1,
          opacity: sparkleAnim,
          transform: [
            {
              rotate: sparkleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })
            }
          ]
        }}
      >
        <Text style={{ fontSize: 20, color: '#f77f00' }}>✨</Text>
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          top: height * 0.3,
          left: width * 0.1,
          opacity: sparkleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1]
          }),
          transform: [
            {
              scale: sparkleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1.2]
              })
            }
          ]
        }}
      >
        <Text style={{ fontSize: 16, color: '#fcbf49' }}>⭐</Text>
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          bottom: height * 0.4,
          right: width * 0.2,
          opacity: sparkleAnim,
        }}
      >
        <Text style={{ fontSize: 18, color: '#f77f00' }}>✨</Text>
      </Animated.View>

      {/* Main Content */}
      <View style={{
        position: 'relative',
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        zIndex: 1,
      }}>
        {/* Handshaking Lottie Animation - Full Width from Edges */}
        <Animated.View style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          height: height * 0.3,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2,
          opacity: handshakingOpacityAnim,
        }}>
          <LottieView
            ref={handshakingLottieRef}
            source={require('../assets/lottie/Handshaking.json')}
            autoPlay
            loop={false}
            style={{
              width: width, // Full screen width
              height: height * 0.25, // Bigger height
            }}
          />
        </Animated.View>
        
        {/* Welcome Lottie Animation */}
        <Animated.View
          style={{
            transform: [
              { scale: scaleAnim },
              { 
                scale: welcomeScaleExitAnim 
              },
              {
                translateY: welcomeCenterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 80] // Move up to center when animation starts
                })
              }
            ],
            marginTop: 50,
            marginBottom: 40,
            shadowColor: '#283618',
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 16,
          }}
        >
          <LottieView
            ref={welcomeLottieRef}
            source={require('../assets/lottie/welcome.json')}
            style={{
              width: 330,
              height: 230,
            }}
            loop={false}
          />
        </Animated.View>

        {/* "to Momentum" Text */}
        {showMomentumText && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              alignItems: 'center',
              marginBottom: 80,
              marginTop: -80,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }
              ]
            }}
          >
            <Text style={{
              fontSize: 32,
              fontFamily: 'AlanSansMedium',
              color: '#344e41',
              textAlign: 'center',
              marginBottom: 12,
              textShadowColor: 'rgba(0, 0, 0, 0.1)',
              textShadowOffset: { width: 1, height: 2 },
              textShadowRadius: 4,
            }}>
              to
            </Text>
            <Text style={{
              fontSize: 64,
              fontFamily: 'BobobyGroovy',
              color: '#283618',
              textAlign: 'center',
              textShadowColor: 'rgba(0, 0, 0, 0.15)',
              textShadowOffset: { width: 2, height: 3 },
              textShadowRadius: 6,
              letterSpacing: 2,
            }}>
              Momentum
            </Text>
          </Animated.View>
        )}

        {/* Enhanced Enter Button */}
        {showEnterButton && (
          <Animated.View
            style={{
              opacity: buttonFadeAnim,
              position: 'absolute',
              bottom: 100,
              transform: [
                {
                  scale: buttonFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1]
                  })
                }
              ]
            }}
          >
            <TouchableOpacity
              onPress={handleEnterPress}
              style={{
                backgroundColor: '#283618',
                paddingHorizontal: 50,
                paddingVertical: 18,
                borderRadius: 35,
                elevation: 8,
                shadowColor: '#283618',
                shadowOffset: {
                  width: 0,
                  height: 6,
                },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                borderWidth: 2,
                borderColor: '#344e41',
                marginTop: -150
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#283618', '#344e41']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 33,
                }}
              />
              <Text className='font-alan-sans-medium' style={{
                color: '#ffffff',
                fontSize: 20,
                textAlign: 'center',
                letterSpacing: 1,
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              }}>
                Enter
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}