# 📱 Sistema Life - Flutter Mobile App

## Complete Project Structure

Este documento descreve a estrutura completa do aplicativo Flutter do Sistema Life.

## 📁 Estrutura Detalhada de Arquivos

```
flutter_app/
│
├── 📱 android/                          # Configurações Android
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── kotlin/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── res/
│   │   ├── build.gradle
│   │   └── google-services.json        # Firebase config
│   ├── gradle/
│   ├── build.gradle
│   └── settings.gradle
│
├── 🍎 ios/                              # Configurações iOS
│   ├── Runner/
│   │   ├── Info.plist
│   │   ├── GoogleService-Info.plist    # Firebase config
│   │   └── Assets.xcassets/
│   ├── Podfile
│   └── Runner.xcworkspace/
│
├── 📚 lib/                              # Código fonte Dart
│   │
│   ├── 🚀 main.dart                     # Entry point
│   ├── 🎯 app.dart                      # App widget principal
│   │
│   ├── 🔧 core/                         # Funcionalidades core
│   │   ├── constants/
│   │   │   ├── app_constants.dart
│   │   │   ├── api_endpoints.dart
│   │   │   ├── asset_paths.dart
│   │   │   └── storage_keys.dart
│   │   │
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   ├── app_colors.dart
│   │   │   ├── app_text_styles.dart
│   │   │   ├── app_dimensions.dart
│   │   │   └── theme_provider.dart
│   │   │
│   │   ├── network/
│   │   │   ├── api_client.dart
│   │   │   ├── dio_client.dart
│   │   │   ├── interceptors/
│   │   │   │   ├── auth_interceptor.dart
│   │   │   │   ├── logging_interceptor.dart
│   │   │   │   └── error_interceptor.dart
│   │   │   └── network_info.dart
│   │   │
│   │   ├── storage/
│   │   │   ├── hive_storage.dart
│   │   │   ├── secure_storage.dart
│   │   │   └── cache_manager.dart
│   │   │
│   │   ├── utils/
│   │   │   ├── date_utils.dart
│   │   │   ├── validators.dart
│   │   │   ├── formatters.dart
│   │   │   ├── extensions/
│   │   │   │   ├── context_extensions.dart
│   │   │   │   ├── string_extensions.dart
│   │   │   │   ├── date_extensions.dart
│   │   │   │   └── num_extensions.dart
│   │   │   └── logger.dart
│   │   │
│   │   └── errors/
│   │       ├── failures.dart
│   │       ├── exceptions.dart
│   │       └── error_handler.dart
│   │
│   ├── 🎮 features/                    # Features modulares
│   │   │
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   ├── user_model.dart
│   │   │   │   │   └── auth_response_model.dart
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── auth_remote_datasource.dart
│   │   │   │   │   └── auth_local_datasource.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user_entity.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── login_usecase.dart
│   │   │   │       ├── register_usecase.dart
│   │   │   │       ├── logout_usecase.dart
│   │   │   │       └── biometric_login_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── auth_provider.dart
│   │   │       ├── pages/
│   │   │       │   ├── splash_page.dart
│   │   │       │   ├── login_page.dart
│   │   │       │   ├── register_page.dart
│   │   │       │   └── forgot_password_page.dart
│   │   │       └── widgets/
│   │   │           ├── auth_button.dart
│   │   │           ├── auth_text_field.dart
│   │   │           └── social_login_buttons.dart
│   │   │
│   │   ├── dashboard/
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   └── dashboard_stats_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── dashboard_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── dashboard_stats.dart
│   │   │   │   └── repositories/
│   │   │   │       └── dashboard_repository.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── dashboard_provider.dart
│   │   │       ├── pages/
│   │   │       │   └── dashboard_page.dart
│   │   │       └── widgets/
│   │   │           ├── stats_card.dart
│   │   │           ├── level_progress_card.dart
│   │   │           ├── quick_actions_grid.dart
│   │   │           └── recent_achievements.dart
│   │   │
│   │   ├── missions/
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   ├── mission_model.dart
│   │   │   │   │   ├── daily_mission_model.dart
│   │   │   │   │   └── subtask_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── mission_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── mission.dart
│   │   │   │   │   └── daily_mission.dart
│   │   │   │   └── repositories/
│   │   │   │       └── mission_repository.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── missions_provider.dart
│   │   │       ├── pages/
│   │   │       │   ├── missions_page.dart
│   │   │       │   └── mission_details_page.dart
│   │   │       └── widgets/
│   │   │           ├── mission_card.dart
│   │   │           ├── mission_progress.dart
│   │   │           ├── subtask_item.dart
│   │   │           ├── rank_badge.dart
│   │   │           └── mission_filters.dart
│   │   │
│   │   ├── goals/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   ├── skills/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   ├── routine/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   ├── shop/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   ├── inventory/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   ├── tower/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   ├── dungeon/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   └── profile/
│   │       ├── data/
│   │       ├── domain/
│   │       └── presentation/
│   │
│   ├── 🔗 shared/                       # Componentes compartilhados
│   │   ├── widgets/
│   │   │   ├── loading_indicator.dart
│   │   │   ├── error_view.dart
│   │   │   ├── empty_state.dart
│   │   │   ├── custom_app_bar.dart
│   │   │   ├── custom_button.dart
│   │   │   ├── custom_card.dart
│   │   │   ├── xp_badge.dart
│   │   │   ├── level_badge.dart
│   │   │   ├── fragment_badge.dart
│   │   │   ├── progress_bar.dart
│   │   │   ├── stat_item.dart
│   │   │   └── shimmer_loading.dart
│   │   │
│   │   ├── models/
│   │   │   ├── base_response.dart
│   │   │   └── pagination.dart
│   │   │
│   │   └── providers/
│   │       ├── connectivity_provider.dart
│   │       └── notification_provider.dart
│   │
│   └── ⚙️ config/                       # Configurações
│       ├── routes/
│       │   ├── app_router.dart
│       │   └── route_names.dart
│       ├── env/
│       │   └── env_config.dart
│       └── firebase/
│           └── firebase_config.dart
│
├── 🎨 assets/                           # Assets do app
│   ├── images/
│   │   ├── logo.png
│   │   ├── splash.png
│   │   └── placeholders/
│   ├── icons/
│   │   └── app_icon.png
│   ├── animations/
│   │   ├── loading.json
│   │   ├── success.json
│   │   ├── level_up.json
│   │   └── mission_complete.json
│   └── fonts/
│       ├── Cinzel-Regular.ttf
│       ├── Cinzel-Bold.ttf
│       ├── Inter-Regular.ttf
│       ├── Inter-Medium.ttf
│       ├── Inter-SemiBold.ttf
│       └── Inter-Bold.ttf
│
├── 🧪 test/                             # Testes
│   ├── unit/
│   ├── widget/
│   └── integration/
│
├── 📄 Arquivos de configuração
├── .env                                 # Variáveis de ambiente
├── .env.example                         # Exemplo de variáveis
├── pubspec.yaml                         # Dependências Flutter
├── analysis_options.yaml                # Linting rules
├── README.md                            # Documentação
└── .gitignore                           # Arquivos ignorados

```

## 🎯 Próximos Passos

1. Criar estrutura de diretórios
2. Implementar arquivos base
3. Configurar Firebase
4. Implementar autenticação
5. Implementar features principais
6. Adicionar testes
7. Build e deploy

## 📚 Documentação Adicional

- [Setup Guide](SETUP.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Contributing Guide](CONTRIBUTING.md)
- [API Documentation](API_DOCS.md)

---

**Total estimado**: ~150+ arquivos | 15,000+ linhas de código
