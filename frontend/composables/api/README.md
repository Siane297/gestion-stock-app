# API Composables - Frontend

## 📁 Structure

```
composables/api/
├── config.ts              # Configuration API et types communs
├── useEmployeeApi.ts      # API Employés
├── useAttendanceApi.ts    # API Pointages
└── README.md             # Cette documentation
```

## 🔧 Configuration (config.ts)

### API_CONFIG
Configuration de base pour toutes les requêtes API :
- **baseURL** : `http://localhost:3001`
- **timeout** : 10000ms
- **headers** : Content-Type JSON

### Types communs
- `ApiResponse<T>` : Format de réponse standard
- `PaginatedResponse<T>` : Réponse avec pagination
- `ApiError` : Classe d'erreur personnalisée

## 👥 API Employés (useEmployeeApi.ts)

### Méthodes disponibles

#### `getEmployees(params?)`
Récupère la liste des employés avec pagination et filtres.

**Paramètres** :
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  isActive?: boolean;
}
```

**Retour** : `PaginatedResponse<Employee>`

**Exemple** :
```typescript
const { getEmployees } = useEmployeeApi();

const result = await getEmployees({
  page: 1,
  limit: 10,
  search: 'Jean',
  department: 'IT'
});
```

#### `getEmployeeById(id)`
Récupère un employé par son ID.

**Paramètres** : `id: string`

**Retour** : `Employee`

#### `getEmployeeByQrCode(qrCode)`
Recherche un employé par son QR code.

**Paramètres** : `qrCode: string`

**Retour** : `Employee`

**Exemple** :
```typescript
const employee = await getEmployeeByQrCode('550e8400-e29b-41d4-a716-446655440000');
```

#### `createEmployee(data)`
Crée un nouvel employé.

**Paramètres** :
```typescript
{
  matricule: string;
  fullName: string;
  email?: string;
  position: string;
  department: string;
  phoneNumber?: string;
  address?: string;
}
```

**Retour** : `Employee` (avec `qrCode` généré)

**Exemple** :
```typescript
const { createEmployee } = useEmployeeApi();

const employee = await createEmployee({
  matricule: 'EMP001',
  fullName: 'Jean Dupont',
  position: 'Développeur',
  department: 'IT',
  email: 'jean@example.com'
});

console.log('QR Code:', employee.qrCode);
```

#### `updateEmployee(id, data)`
Met à jour un employé existant.

**Paramètres** :
- `id: string`
- `data: UpdateEmployeeDto`

**Retour** : `Employee`

#### `deleteEmployee(id)`
Supprime un employé (soft delete).

**Paramètres** : `id: string`

**Retour** : `void`

## ⏰ API Pointages (useAttendanceApi.ts)

### Méthodes disponibles

#### `getAttendances(params?)`
Récupère la liste des pointages avec filtres.

**Paramètres** :
```typescript
{
  page?: number;
  limit?: number;
  employeeId?: string;
  startDate?: string;  // Format: YYYY-MM-DD
  endDate?: string;    // Format: YYYY-MM-DD
  type?: 'ENTRY' | 'EXIT';
}
```

**Retour** : `PaginatedResponse<Attendance>`

**Exemple** :
```typescript
const { getAttendances } = useAttendanceApi();

const result = await getAttendances({
  employeeId: 'uuid',
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  type: 'ENTRY'
});
```

#### `createAttendance(data)`
Crée un pointage manuel.

**Paramètres** :
```typescript
{
  employeeId: string;
  type: 'ENTRY' | 'EXIT';
  location?: string;
  notes?: string;
}
```

**Retour** : `Attendance`

#### `scanAttendance(data)`
Enregistre un pointage via QR code (route publique).

**Paramètres** :
```typescript
{
  qrCode: string;
  type: 'ENTRY' | 'EXIT';
  location?: string;
  notes?: string;
}
```

**Retour** : `Attendance` (avec informations employé)

**Exemple** :
```typescript
const { scanAttendance } = useAttendanceApi();

const attendance = await scanAttendance({
  qrCode: '550e8400-e29b-41d4-a716-446655440000',
  type: 'ENTRY'
});

console.log('Pointage enregistré:', attendance);
console.log('Employé:', attendance.employee?.fullName);
```

#### `getEmployeeAttendanceForDate(employeeId, date)`
Récupère les pointages d'un employé pour une date spécifique.

**Paramètres** :
- `employeeId: string`
- `date: string` (Format: YYYY-MM-DD)

**Retour** : `Attendance[]`

**Exemple** :
```typescript
const attendances = await getEmployeeAttendanceForDate(
  'uuid-employee',
  '2025-11-03'
);
```

## 🎯 Utilisation dans les composants

### Exemple : Enregistrer un employé

```vue
<script setup lang="ts">
import { useEmployeeApi } from '~/composables/api/useEmployeeApi';

const { createEmployee } = useEmployeeApi();
const loading = ref(false);
const error = ref('');

const handleSubmit = async (formData) => {
  loading.value = true;
  error.value = '';

  try {
    const employee = await createEmployee({
      matricule: formData.matricule,
      fullName: formData.fullName,
      position: formData.position,
      department: formData.department,
      email: formData.email,
    });

    console.log('Employé créé:', employee);
    console.log('QR Code généré:', employee.qrCode);
    
    // Afficher succès
    alert('✅ Employé enregistré avec succès !');
  } catch (err: any) {
    error.value = err.message;
    alert(`❌ Erreur: ${err.message}`);
  } finally {
    loading.value = false;
  }
};
</script>
```

### Exemple : Scanner un QR code

```vue
<script setup lang="ts">
import { useAttendanceApi } from '~/composables/api/useAttendanceApi';

const { scanAttendance } = useAttendanceApi();

const onQrCodeScanned = async (qrCode: string, type: 'ENTRY' | 'EXIT') => {
  try {
    const attendance = await scanAttendance({
      qrCode,
      type,
    });

    console.log('Pointage enregistré:', attendance);
    console.log('Employé:', attendance.employee?.fullName);
    console.log('Heure:', attendance.timestamp);

    // Afficher succès
    alert(`✅ ${type === 'ENTRY' ? 'Entrée' : 'Sortie'} enregistrée !`);
  } catch (err: any) {
    alert(`❌ Erreur: ${err.message}`);
  }
};
</script>
```

## 🔒 Gestion des erreurs

Toutes les méthodes utilisent `handleApiError()` pour formater les erreurs :

```typescript
try {
  const result = await createEmployee(data);
} catch (error: any) {
  // error.message contient un message d'erreur formaté
  console.error(error.message);
}
```

## 📝 Types TypeScript

Tous les types sont exportés et peuvent être importés :

```typescript
import type { 
  Employee, 
  CreateEmployeeDto,
  Attendance,
  ScanAttendanceDto 
} from '~/composables/api/useEmployeeApi';
```

## 🚀 Prochaines étapes

- [ ] Ajouter authentification JWT
- [ ] Implémenter cache local
- [ ] Ajouter retry automatique
- [ ] Gérer mode hors ligne
- [ ] Ajouter statistiques API

---

**Documentation mise à jour** : 03/11/2025
