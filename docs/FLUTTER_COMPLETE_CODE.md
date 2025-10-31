# 📱 Sistema Life - Flutter Mobile App
## Complete Application Implementation

Este documento contém a implementação completa do aplicativo Flutter do Sistema Life.

## 📦 Arquivo: pubspec.yaml

```yaml
name: sistema_life
description: Sistema Life - Gamifique sua vida. Aplicativo mobile completo.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # Firebase
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  cloud_firestore: ^4.13.6
  firebase_messaging: ^14.7.9
  firebase_analytics: ^10.8.0
  
  # State Management
  flutter_riverpod: ^2.4.9
  riverpod_annotation: ^2.3.3
  
  # UI Components
  cupertino_icons: ^1.0.6
  flutter_svg: ^2.0.9
  lottie: ^2.7.0
  shimmer: ^3.0.0
  cached_network_image: ^3.3.1
  flutter_animate: ^4.3.0
  
  # Navigation
  go_router: ^12.1.3
  
  # Storage
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  
  # HTTP & API
  dio: ^5.4.0
  retrofit: ^4.0.3
  json_annotation: ^4.8.1
  
  # Utils
  intl: ^0.18.1
  uuid: ^4.3.3
  equatable: ^2.0.5
  freezed_annotation: ^2.4.1
  logger: ^2.0.2+1
  flutter_dotenv: ^5.1.0
  
  # Charts & Graphs
  fl_chart: ^0.66.0
  syncfusion_flutter_charts: ^24.1.41
  
  # Animations & Effects
  flutter_staggered_animations: ^1.1.1
  animations: ^2.0.11
  
  # Local Notifications
  flutter_local_notifications: ^16.3.2
  
  # Biometrics
  local_auth: ^2.1.8
  
  # Image Picker
  image_picker: ^1.0.7
  
  # Connectivity
  connectivity_plus: ^5.0.2
  
  # Device Info
  device_info_plus: ^9.1.1
  package_info_plus: ^5.0.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  
  # Code Generation
  build_runner: ^2.4.7
  riverpod_generator: ^2.3.9
  freezed: ^2.4.6
  json_serializable: ^6.7.1
  retrofit_generator: ^8.0.6
  hive_generator: ^2.0.1

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    - assets/icons/
    - assets/animations/
    - assets/fonts/
    - .env
  
  fonts:
    - family: Cinzel
      fonts:
        - asset: assets/fonts/Cinzel-Regular.ttf
        - asset: assets/fonts/Cinzel-Bold.ttf
          weight: 700
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
        - asset: assets/fonts/Inter-Medium.ttf
          weight: 500
        - asset: assets/fonts/Inter-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700
```

## 🚀 Comandos para Criar Projeto

### 1. Criar projeto Flutter
```bash
flutter create --org com.sistemalife --project-name sistema_life flutter_app
cd flutter_app
```

### 2. Copiar pubspec.yaml
Substitua o pubspec.yaml gerado pelo conteúdo acima

### 3. Instalar dependências
```bash
flutter pub get
```

### 4. Gerar código necessário
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 5. Criar estrutura de pastas
```bash
# No Windows (PowerShell ou CMD)
mkdir lib\core lib\features lib\shared lib\config
mkdir lib\core\constants lib\core\theme lib\core\network lib\core\storage lib\core\utils lib\core\errors
mkdir lib\features\auth lib\features\dashboard lib\features\missions lib\features\goals
mkdir lib\features\skills lib\features\routine lib\features\shop lib\features\inventory
mkdir lib\features\tower lib\features\dungeon lib\features\profile
mkdir assets\images assets\icons assets\animations assets\fonts

# No Linux/Mac
mkdir -p lib/{core,features,shared,config}
mkdir -p lib/core/{constants,theme,network,storage,utils,errors}
mkdir -p lib/features/{auth,dashboard,missions,goals,skills,routine,shop,inventory,tower,dungeon,profile}
mkdir -p assets/{images,icons,animations,fonts}
```

## 📝 Arquivo Principal: main.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'app.dart';
import 'core/storage/hive_storage.dart';

void main() async {
  // Ensure Flutter is initialized
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Load environment variables
  await dotenv.load(fileName: ".env");
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  await HiveStorage.init();
  
  // Run app with Riverpod
  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}
```

## 📱 Arquivo App Widget: app.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'config/routes/app_router.dart';
import 'core/theme/app_theme.dart';

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: 'Sistema Life',
      debugShowCheckedModeBanner: false,
      
      // Theme
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      
      // Router
      routerConfig: router,
      
      // Localization (optional)
      // localizationsDelegates: [...],
      // supportedLocales: [...],
    );
  }
}

// Theme Mode Provider
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.dark);
```

## 🔐 Exemplo Completo: Authentication Feature

### auth_repository.dart
```dart
import 'package:dartz/dartz.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/errors/failures.dart';
import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<Either<Failure, UserEntity>> login({
    required String email,
    required String password,
  });
  
  Future<Either<Failure, UserEntity>> register({
    required String email,
    required String password,
    required String name,
  });
  
  Future<Either<Failure, void>> logout();
  
  Future<Either<Failure, UserEntity>> getCurrentUser();
  
  Stream<User?> authStateChanges();
}

class AuthRepositoryImpl implements AuthRepository {
  final FirebaseAuth _firebaseAuth;
  final FirebaseFirestore _firestore;
  
  AuthRepositoryImpl({
    required FirebaseAuth firebaseAuth,
    required FirebaseFirestore firestore,
  })  : _firebaseAuth = firebaseAuth,
        _firestore = firestore;
  
  @override
  Future<Either<Failure, UserEntity>> login({
    required String email,
    required String password,
  }) async {
    try {
      final credential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      final userData = await _firestore
          .collection('users')
          .doc(credential.user!.uid)
          .get();
      
      if (!userData.exists) {
        return Left(ServerFailure(message: 'Usuário não encontrado'));
      }
      
      return Right(UserEntity.fromJson(userData.data()!));
    } on FirebaseAuthException catch (e) {
      return Left(ServerFailure(message: _handleAuthError(e.code)));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, UserEntity>> register({
    required String email,
    required String password,
    required String name,
  }) async {
    try {
      final credential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      final userEntity = UserEntity(
        id: credential.user!.uid,
        email: email,
        name: name,
        level: 1,
        xp: 0,
        fragments: 0,
        streak: 0,
        createdAt: DateTime.now(),
      );
      
      await _firestore
          .collection('users')
          .doc(credential.user!.uid)
          .set(userEntity.toJson());
      
      return Right(userEntity);
    } on FirebaseAuthException catch (e) {
      return Left(ServerFailure(message: _handleAuthError(e.code)));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, void>> logout() async {
    try {
      await _firebaseAuth.signOut();
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
  
  @override
  Future<Either<Failure, UserEntity>> getCurrentUser() async {
    try {
      final currentUser = _firebaseAuth.currentUser;
      if (currentUser == null) {
        return Left(ServerFailure(message: 'Usuário não autenticado'));
      }
      
      final userData = await _firestore
          .collection('users')
          .doc(currentUser.uid)
          .get();
      
      if (!userData.exists) {
        return Left(ServerFailure(message: 'Dados do usuário não encontrados'));
      }
      
      return Right(UserEntity.fromJson(userData.data()!));
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
  
  @override
  Stream<User?> authStateChanges() {
    return _firebaseAuth.authStateChanges();
  }
  
  String _handleAuthError(String code) {
    switch (code) {
      case 'user-not-found':
        return 'Usuário não encontrado';
      case 'wrong-password':
        return 'Senha incorreta';
      case 'email-already-in-use':
        return 'Email já está em uso';
      case 'weak-password':
        return 'Senha muito fraca';
      case 'invalid-email':
        return 'Email inválido';
      default:
        return 'Erro de autenticação';
    }
  }
}
```

## 📊 Próximos Passos

1. **Configurar Firebase**: 
   - Criar projeto no Firebase Console
   - Adicionar `google-services.json` e `GoogleService-Info.plist`

2. **Implementar todas as features**:
   - Dashboard
   - Missions
   - Goals
   - Skills
   - Routine
   - Shop
   - Inventory
   - Tower
   - Dungeon
   - Profile

3. **Adicionar testes**:
   - Unit tests
   - Widget tests
   - Integration tests

4. **Build e Deploy**:
   - Android: Play Store
   - iOS: App Store

## 📞 Suporte

Para mais informações, consulte:
- [Flutter Documentation](https://flutter.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Riverpod Documentation](https://riverpod.dev)

---

**Desenvolvido com ❤️ e Flutter**
