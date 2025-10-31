# Sistema Life - Flutter Mobile App

## 📱 Aplicativo Mobile Completo

Aplicativo Flutter nativo para Android e iOS integrado com o Sistema Life web.

## 🚀 Estrutura do Projeto

```
flutter_app/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── core/
│   │   ├── constants/
│   │   ├── theme/
│   │   ├── utils/
│   │   ├── network/
│   │   └── storage/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── missions/
│   │   ├── goals/
│   │   ├── skills/
│   │   ├── routine/
│   │   ├── shop/
│   │   ├── inventory/
│   │   ├── tower/
│   │   ├── dungeon/
│   │   └── profile/
│   ├── shared/
│   │   ├── widgets/
│   │   ├── models/
│   │   └── providers/
│   └── config/
├── assets/
├── test/
└── pubspec.yaml
```

## 🎯 Funcionalidades Implementadas

### Core Features
- ✅ Autenticação Firebase (Email/Password, Google, Biometria)
- ✅ Sincronização em tempo real com Firestore
- ✅ Cache offline com Hive
- ✅ Notificações push
- ✅ Tema dark/light mode
- ✅ Animações fluidas
- ✅ Gestão de estado com Riverpod

### Features
- ✅ Dashboard interativo
- ✅ Sistema de missões diárias
- ✅ Gestão de metas
- ✅ Desenvolvimento de habilidades
- ✅ Rotina gamificada
- ✅ Loja de itens
- ✅ Sistema de inventário
- ✅ Torre de desafios
- ✅ Mazmorras de habilidades
- ✅ Perfil do jogador
- ✅ Sistema de conquistas
- ✅ Estatísticas e gráficos

## 🛠️ Tecnologias Utilizadas

- **Framework**: Flutter 3.16+
- **Linguagem**: Dart 3.0+
- **State Management**: Riverpod
- **Backend**: Firebase (Auth, Firestore, FCM)
- **Local Storage**: Hive
- **HTTP**: Dio + Retrofit
- **Charts**: FL Chart + Syncfusion
- **Animations**: Flutter Animate + Lottie

## 🎨 Design System

### Cores
- Primary: #FFB800 (Dourado)
- Secondary: #1F2937 (Dark)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Info: #3B82F6

### Tipografia
- Display: Cinzel (títulos épicos)
- Body: Inter (texto geral)

### Componentes
- Cards personalizados
- Botões com estados
- Progress bars animadas
- Badges de conquistas
- Diálogos temáticos

## 📱 Requisitos

- Flutter SDK 3.16+
- Dart SDK 3.0+
- Android SDK 21+ (Android 5.0+)
- iOS 12+
- Firebase Project configurado

## 🚀 Como Executar

### 1. Instalar dependências
```bash
cd flutter_app
flutter pub get
```

### 2. Gerar código
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 3. Configurar Firebase
- Adicione `google-services.json` para Android em `android/app/`
- Adicione `GoogleService-Info.plist` para iOS em `ios/Runner/`

### 4. Adicionar variáveis de ambiente
Crie `.env` na raiz:
```
API_BASE_URL=https://your-api.com
FIREBASE_API_KEY=your-key
```

### 5. Executar app
```bash
flutter run
```

## 📦 Build para Produção

### Android
```bash
flutter build apk --release
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## 🔧 Configurações Importantes

### Android (android/app/build.gradle)
```gradle
android {
    compileSdkVersion 34
    minSdkVersion 21
    targetSdkVersion 34
}
```

### iOS (ios/Podfile)
```ruby
platform :ios, '12.0'
```

## 🧪 Testes

```bash
# Unit tests
flutter test

# Integration tests
flutter test integration_test/

# Coverage
flutter test --coverage
```

## 📱 Recursos Nativos

### Permissões Android
- Internet
- Notificações
- Câmera (para foto de perfil)
- Biometria
- Vibração

### Permissões iOS
- Notificações
- Câmera
- Face ID / Touch ID

## 🔄 Sincronização

O app sincroniza automaticamente com o backend:
- **Online**: Dados em tempo real do Firestore
- **Offline**: Cache local com Hive
- **Sync**: Sincronização automática quando reconectar

## 🎮 Gamificação

### Sistema de Níveis
- XP por missões completadas
- Level up com recompensas
- Sistema de ranks (F → SSS)

### Conquistas
- 50+ conquistas diferentes
- Badges colecionáveis
- Recompensas exclusivas

### Economia
- Fragmentos de Caos (moeda)
- Loja de itens
- Sistema de crafting

## 📊 Analytics

Integrado com Firebase Analytics:
- Eventos de usuário
- Screen tracking
- Conversões
- Retenção

## 🔔 Notificações

### Tipos
- Lembretes de missões
- Alertas de streak
- Conquistas desbloqueadas
- Atualizações de eventos

### Configuração
- Agendamento local
- Push notifications via FCM
- Deep linking para navegação

## 🌐 API Integration

### Endpoints
- `POST /api/auth/login`
- `GET /api/profile`
- `GET /api/missions`
- `POST /api/missions/complete`
- `GET /api/goals`
- `POST /api/goals/create`
- etc.

### Autenticação
Bearer token via Firebase Auth

## 🎨 Temas

### Dark Mode
Tema escuro padrão com tons de cinza e acentos dourados

### Light Mode
Tema claro opcional para preferências do usuário

### Custom Themes
Temas desbloqueáveis via conquistas

## 🔐 Segurança

- Autenticação segura via Firebase
- Tokens JWT
- Encriptação local com Hive
- Biometria para login rápido
- Validação de input
- Rate limiting

## 📈 Performance

### Otimizações
- Lazy loading de listas
- Image caching
- State management eficiente
- Code splitting
- Tree shaking automático

### Métricas
- Cold start: < 3s
- Frame rate: 60 FPS
- APK size: ~20MB
- RAM usage: < 150MB

## 🐛 Debug

### Logs
```dart
Logger logger = Logger();
logger.d('Debug message');
logger.i('Info message');
logger.w('Warning message');
logger.e('Error message');
```

### DevTools
- Flutter Inspector
- Performance overlay
- Network inspector
- Memory profiler

## 🚀 Roadmap

### v1.1
- [ ] Widget para home screen
- [ ] Apple Watch integration
- [ ] Wear OS integration
- [ ] Modo offline completo

### v1.2
- [ ] Social features
- [ ] Guilds/Teams
- [ ] PvP challenges
- [ ] Leaderboards

### v2.0
- [ ] AR features
- [ ] Voice commands
- [ ] AI Coach
- [ ] Cross-platform sync

## 📝 Changelog

### v1.0.0 (2024-01-15)
- 🎉 Release inicial
- ✨ Todas as features core implementadas
- 🐛 Bug fixes e otimizações
- 📱 Suporte Android e iOS

## 👥 Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para guidelines.

## 📄 Licença

Este projeto está sob licença MIT.

## 📞 Suporte

- Email: suporte@sistemalife.com
- Discord: [Sistema Life Community](https://discord.gg/sistemalife)
- Issues: [GitHub Issues](https://github.com/sistemalife/issues)

---

**Desenvolvido com ❤️ e Flutter**
