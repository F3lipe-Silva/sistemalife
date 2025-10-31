# 🎯 Guia de Implementação - Flutter App

## Ordem de Implementação Recomendada

### Fase 1: Setup Inicial (Dia 1-2)

#### 1.1 Criar Projeto Flutter
```bash
flutter create --org com.sistemalife sistema_life
cd sistema_life
```

#### 1.2 Configurar pubspec.yaml
- Copiar dependências do arquivo fornecido
- Executar `flutter pub get`

#### 1.3 Estrutura de Pastas
```bash
mkdir -p lib/{core,features,shared,config}
mkdir -p lib/core/{constants,theme,network,storage,utils,errors}
mkdir -p lib/features/{auth,dashboard,missions,goals,skills,routine,shop,inventory,tower,dungeon,profile}
mkdir -p assets/{images,icons,animations,fonts}
```

### Fase 2: Core Setup (Dia 3-5)

#### 2.1 Firebase Configuration
```dart
// lib/main.dart
import 'package:firebase_core/firebase_core.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await HiveStorage.init();
  runApp(ProviderScope(child: MyApp()));
}
```

#### 2.2 Theme Configuration
```dart
// lib/core/theme/app_theme.dart
class AppTheme {
  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.background,
    // ... complete theme
  );
}
```

#### 2.3 Router Setup
```dart
// lib/config/routes/app_router.dart
final goRouter = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => SplashPage()),
    GoRoute(path: '/login', builder: (context, state) => LoginPage()),
    GoRoute(path: '/dashboard', builder: (context, state) => DashboardPage()),
    // ... all routes
  ],
);
```

### Fase 3: Autenticação (Dia 6-8)

#### 3.1 Auth Repository
```dart
// lib/features/auth/data/repositories/auth_repository_impl.dart
class AuthRepositoryImpl implements AuthRepository {
  final FirebaseAuth _firebaseAuth;
  final Firestore _firestore;
  
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
      
      return Right(UserModel.fromJson(userData.data()!).toEntity());
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }
}
```

#### 3.2 Auth Provider (Riverpod)
```dart
// lib/features/auth/presentation/providers/auth_provider.dart
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AsyncValue<UserEntity?> build() {
    return const AsyncValue.loading();
  }
  
  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    
    final result = await ref.read(authRepositoryProvider).login(
      email: email,
      password: password,
    );
    
    state = result.fold(
      (failure) => AsyncValue.error(failure, StackTrace.current),
      (user) => AsyncValue.data(user),
    );
  }
}
```

#### 3.3 Login Page
```dart
// lib/features/auth/presentation/pages/login_page.dart
class LoginPage extends ConsumerStatefulWidget {
  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                // Logo
                Image.asset('assets/images/logo.png', height: 120),
                SizedBox(height: 48),
                
                // Title
                Text(
                  'SISTEMA LIFE',
                  style: Theme.of(context).textTheme.displayLarge,
                ),
                SizedBox(height: 8),
                Text(
                  'Gamifique sua vida',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                SizedBox(height: 48),
                
                // Email field
                AuthTextField(
                  controller: _emailController,
                  label: 'Email',
                  keyboardType: TextInputType.emailAddress,
                  validator: Validators.email,
                ),
                SizedBox(height: 16),
                
                // Password field
                AuthTextField(
                  controller: _passwordController,
                  label: 'Senha',
                  obscureText: true,
                  validator: Validators.password,
                ),
                SizedBox(height: 24),
                
                // Login button
                AuthButton(
                  onPressed: _handleLogin,
                  isLoading: authState.isLoading,
                  child: Text('ENTRAR'),
                ),
                SizedBox(height: 16),
                
                // Biometric login
                IconButton(
                  icon: Icon(Icons.fingerprint),
                  onPressed: _handleBiometricLogin,
                ),
                
                // Register link
                TextButton(
                  onPressed: () => context.go('/register'),
                  child: Text('Criar conta'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  void _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      await ref.read(authNotifierProvider.notifier).login(
        _emailController.text,
        _passwordController.text,
      );
      
      ref.listen(authNotifierProvider, (previous, next) {
        next.whenOrNull(
          data: (user) {
            if (user != null) {
              context.go('/dashboard');
            }
          },
          error: (error, stack) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(error.toString())),
            );
          },
        );
      });
    }
  }
  
  void _handleBiometricLogin() async {
    // Implement biometric authentication
  }
}
```

### Fase 4: Dashboard (Dia 9-11)

#### 4.1 Dashboard Provider
```dart
// lib/features/dashboard/presentation/providers/dashboard_provider.dart
@riverpod
class Dashboard extends _$Dashboard {
  @override
  Future<DashboardStats> build() async {
    return ref.read(dashboardRepositoryProvider).getDashboardStats();
  }
  
  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return ref.read(dashboardRepositoryProvider).getDashboardStats();
    });
  }
}
```

#### 4.2 Dashboard Page
```dart
// lib/features/dashboard/presentation/pages/dashboard_page.dart
class DashboardPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(dashboardProvider);
    
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Dashboard',
        actions: [
          IconButton(
            icon: Icon(Icons.notifications),
            onPressed: () => context.push('/notifications'),
          ),
        ],
      ),
      body: dashboardState.when(
        data: (stats) => RefreshIndicator(
          onRefresh: () => ref.read(dashboardProvider.notifier).refresh(),
          child: SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Player Level Card
                LevelProgressCard(
                  level: stats.level,
                  currentXp: stats.currentXp,
                  requiredXp: stats.requiredXp,
                  playerName: stats.playerName,
                  avatar: stats.avatar,
                ),
                SizedBox(height: 24),
                
                // Stats Grid
                GridView.count(
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 1.5,
                  children: [
                    StatsCard(
                      icon: Icons.local_fire_department,
                      title: 'Streak',
                      value: '${stats.streak} dias',
                      color: Colors.orange,
                      trend: stats.streakTrend,
                    ),
                    StatsCard(
                      icon: Icons.check_circle,
                      title: 'Missões',
                      value: '${stats.completedMissions}',
                      color: Colors.green,
                    ),
                    StatsCard(
                      icon: Icons.diamond,
                      title: 'Fragmentos',
                      value: '${stats.fragments}',
                      color: Colors.amber,
                    ),
                    StatsCard(
                      icon: Icons.emoji_events,
                      title: 'Conquistas',
                      value: '${stats.achievements}',
                      color: Colors.blue,
                    ),
                  ],
                ),
                SizedBox(height: 24),
                
                // Quick Actions
                Text(
                  'Ações Rápidas',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                SizedBox(height: 16),
                QuickActionsGrid(),
                
                SizedBox(height: 24),
                
                // Recent Achievements
                Text(
                  'Conquistas Recentes',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                SizedBox(height: 16),
                RecentAchievements(achievements: stats.recentAchievements),
              ],
            ),
          ),
        ),
        loading: () => Center(child: CircularProgressIndicator()),
        error: (error, stack) => ErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(dashboardProvider),
        ),
      ),
      bottomNavigationBar: CustomBottomNavBar(currentIndex: 0),
    );
  }
}
```

### Fase 5: Missions (Dia 12-15)

#### 5.1 Mission Model
```dart
// lib/features/missions/data/models/mission_model.dart
@freezed
class MissionModel with _$MissionModel {
  const factory MissionModel({
    required String id,
    required String name,
    required String description,
    required int xpReward,
    required int fragmentsReward,
    required bool completed,
    required String rank,
    required List<SubTaskModel> subTasks,
    List<String>? learningResources,
    DateTime? completedAt,
  }) = _MissionModel;
  
  factory MissionModel.fromJson(Map<String, dynamic> json) =>
      _$MissionModelFromJson(json);
}
```

#### 5.2 Missions Page
```dart
// lib/features/missions/presentation/pages/missions_page.dart
class MissionsPage extends ConsumerStatefulWidget {
  @override
  ConsumerState<MissionsPage> createState() => _MissionsPageState();
}

class _MissionsPageState extends ConsumerState<MissionsPage> {
  String _selectedFilter = 'all';
  String _selectedSort = 'rank';
  
  @override
  Widget build(BuildContext context) {
    final missionsState = ref.watch(missionsProvider);
    
    return Scaffold(
      appBar: CustomAppBar(
        title: 'Missões',
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list),
            onPressed: _showFilters,
          ),
          IconButton(
            icon: Icon(Icons.sort),
            onPressed: _showSortOptions,
          ),
        ],
      ),
      body: Column(
        children: [
          // Stats Panel
          MissionStatsPanel(),
          
          // Search Bar
          Padding(
            padding: EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Procurar missão...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) {
                ref.read(missionsProvider.notifier).search(value);
              },
            ),
          ),
          
          // Missions List
          Expanded(
            child: missionsState.when(
              data: (missions) {
                if (missions.isEmpty) {
                  return EmptyState(
                    icon: Icons.inbox,
                    title: 'Nenhuma missão',
                    message: 'Você completou todas as missões!',
                  );
                }
                
                return ListView.builder(
                  padding: EdgeInsets.all(16),
                  itemCount: missions.length,
                  itemBuilder: (context, index) {
                    final mission = missions[index];
                    return MissionCard(
                      mission: mission,
                      onTap: () => _openMissionDetails(mission),
                      onComplete: () => _completeMission(mission),
                      onPriority: () => _togglePriority(mission),
                    ).animate().fadeIn().slideY();
                  },
                );
              },
              loading: () => ShimmerLoading(itemCount: 5),
              error: (error, stack) => ErrorView(
                message: error.toString(),
                onRetry: () => ref.invalidate(missionsProvider),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _createManualMission(),
        child: Icon(Icons.add),
      ),
      bottomNavigationBar: CustomBottomNavBar(currentIndex: 1),
    );
  }
}
```

### Fase 6: Features Adicionais (Dia 16-25)

- Goals (Metas)
- Skills (Habilidades)
- Routine (Rotina)
- Shop (Loja)
- Inventory (Inventário)
- Tower (Torre)
- Dungeon (Masmorra)
- Profile (Perfil)

### Fase 7: Integrações (Dia 26-28)

- Notificações Push
- Analytics
- Crash Reporting
- Deep Linking
- Compartilhamento Social

### Fase 8: Testes e Polimento (Dia 29-30)

- Unit Tests
- Widget Tests
- Integration Tests
- Performance Optimization
- UI Polish

## 🚀 Scripts Úteis

### Gerar código
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Executar testes
```bash
flutter test --coverage
```

### Build Android
```bash
flutter build apk --release
flutter build appbundle --release
```

### Build iOS
```bash
flutter build ios --release
```

## 📦 Estrutura de Commits

```
feat: adiciona autenticação com Firebase
fix: corrige bug no login biométrico
refactor: melhora estrutura do dashboard
style: ajusta espaçamento dos cards
test: adiciona testes para missions
docs: atualiza README com instruções
```

## 🎯 Checklist de Implementação

### Core
- [ ] Setup projeto Flutter
- [ ] Configurar Firebase
- [ ] Implementar tema
- [ ] Configurar rotas
- [ ] Setup Hive storage
- [ ] Implementar network layer

### Features
- [ ] Autenticação
- [ ] Dashboard
- [ ] Missões
- [ ] Metas
- [ ] Habilidades
- [ ] Rotina
- [ ] Loja
- [ ] Inventário
- [ ] Torre
- [ ] Masmorra
- [ ] Perfil

### Extras
- [ ] Notificações
- [ ] Analytics
- [ ] Deep linking
- [ ] Biometria
- [ ] Cache offline
- [ ] Sincronização

### Quality
- [ ] Unit tests
- [ ] Widget tests
- [ ] Integration tests
- [ ] Code coverage > 80%
- [ ] Performance audit
- [ ] Accessibility audit

---

**Tempo estimado total**: 30 dias de desenvolvimento
**Linhas de código estimadas**: 15,000+
**Arquivos estimados**: 150+
