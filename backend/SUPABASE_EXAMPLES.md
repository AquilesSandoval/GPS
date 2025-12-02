# Ejemplos de Uso de Supabase

Este documento proporciona ejemplos prácticos de cómo utilizar el cliente de Supabase en lugar de consultas SQL directas.

## Configuración Básica

```javascript
const { supabase } = require('../config/database');
```

## Ejemplos de Operaciones CRUD

### SELECT - Obtener Datos

#### Obtener todos los registros
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*');

if (error) {
  throw error;
}
return data;
```

#### Obtener con filtros
```javascript
// WHERE email = 'user@example.com'
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', 'user@example.com')
  .single(); // Para obtener un solo registro

// WHERE is_active = true
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('is_active', true);

// WHERE role_id IN (2, 3)
const { data, error } = await supabase
  .from('users')
  .select('*')
  .in('role_id', [2, 3]);
```

#### SELECT con JOIN
```javascript
// LEFT JOIN con tabla relacionada
const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    users:created_by (uuid, name, email),
    project_types (name),
    project_statuses (name, color)
  `);
```

#### SELECT con paginación
```javascript
const { data, error, count } = await supabase
  .from('users')
  .select('*', { count: 'exact' })
  .range(0, 9); // Obtener registros 0-9 (primeros 10)
```

#### SELECT con ordenamiento
```javascript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .order('created_at', { ascending: false });
```

### INSERT - Insertar Datos

#### Insertar un registro
```javascript
const { data, error } = await supabase
  .from('users')
  .insert({
    uuid: uuid.v4(),
    name: 'John Doe',
    email: 'john@example.com',
    password_hash: hashedPassword,
    role_id: 1,
    is_active: true,
  })
  .select() // Para obtener el registro insertado
  .single();

if (error) {
  throw error;
}
return data;
```

#### Insertar múltiples registros
```javascript
const { data, error } = await supabase
  .from('project_authors')
  .insert([
    { project_uuid: projectId, user_uuid: userId1 },
    { project_uuid: projectId, user_uuid: userId2 },
  ]);
```

### UPDATE - Actualizar Datos

#### Actualizar un registro
```javascript
const { data, error } = await supabase
  .from('users')
  .update({
    name: 'Jane Doe',
    email: 'jane@example.com',
    updated_at: new Date().toISOString(),
  })
  .eq('uuid', userId)
  .select()
  .single();

if (error) {
  throw error;
}
return data;
```

#### Actualizar con condiciones múltiples
```javascript
const { data, error } = await supabase
  .from('projects')
  .update({ status_id: 2 })
  .eq('created_by', userId)
  .eq('status_id', 1);
```

### DELETE - Eliminar Datos

#### Eliminar un registro
```javascript
const { error } = await supabase
  .from('documents')
  .delete()
  .eq('uuid', documentId);

if (error) {
  throw error;
}
```

#### Eliminar con condiciones
```javascript
const { error } = await supabase
  .from('comments')
  .delete()
  .eq('project_uuid', projectId)
  .eq('user_uuid', userId);
```

## Operadores de Filtrado

### Operadores de Comparación
```javascript
// Igual a
.eq('column', 'value')

// No igual a
.neq('column', 'value')

// Mayor que
.gt('age', 18)

// Mayor o igual que
.gte('age', 18)

// Menor que
.lt('age', 65)

// Menor o igual que
.lte('age', 65)
```

### Operadores de Texto
```javascript
// LIKE '%texto%'
.like('name', '%John%')

// ILIKE '%texto%' (case insensitive)
.ilike('email', '%@gmail.com')

// Búsqueda full-text
.textSearch('description', 'investigación')
```

### Operadores Lógicos
```javascript
// IN
.in('status_id', [1, 2, 3])

// IS NULL
.is('deleted_at', null)

// OR
.or('status_id.eq.1,status_id.eq.2')
```

## Manejo de Errores

```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single();

if (error) {
  if (error.code === 'PGRST116') {
    // No se encontró el registro
    return null;
  }
  throw error;
}

return data;
```

## Transacciones con RPC

Para operaciones complejas que requieren transacciones, usa funciones RPC de PostgreSQL:

```javascript
// En Supabase, crea una función SQL:
// CREATE OR REPLACE FUNCTION transfer_project(
//   from_user uuid,
//   to_user uuid,
//   proj_uuid uuid
// ) RETURNS void AS $$
// BEGIN
//   UPDATE projects SET created_by = to_user WHERE uuid = proj_uuid;
//   INSERT INTO project_history (project_uuid, action, user_uuid) 
//   VALUES (proj_uuid, 'transferred', to_user);
// END;
// $$ LANGUAGE plpgsql;

// Luego llámala desde JavaScript:
const { data, error } = await supabase
  .rpc('transfer_project', {
    from_user: fromUserId,
    to_user: toUserId,
    proj_uuid: projectId,
  });
```

## Ejemplo Completo: Modelo de Usuario

```javascript
const { supabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  // Obtener todos los usuarios con filtros
  static async getAll(filters = {}) {
    let query = supabase
      .from('users')
      .select(`
        uuid, 
        name, 
        email, 
        roles (id, name),
        is_active,
        created_at
      `);

    if (filters.roleId) {
      query = query.eq('role_id', filters.roleId);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Obtener usuario por UUID
  static async getByUuid(uuid) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        roles (id, name)
      `)
      .eq('uuid', uuid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // Obtener usuario por email
  static async getByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // Crear nuevo usuario
  static async create(userData) {
    const uuid = uuidv4();
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({
        uuid,
        name: userData.name,
        email: userData.email,
        password_hash: passwordHash,
        role_id: userData.roleId,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Actualizar usuario
  static async update(uuid, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('uuid', uuid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Cambiar contraseña
  static async updatePassword(uuid, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('uuid', uuid);

    if (error) throw error;
    return true;
  }

  // Activar/Desactivar usuario
  static async toggleActive(uuid) {
    // Primero obtener el estado actual
    const user = await this.getByUuid(uuid);
    
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('uuid', uuid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = User;
```

## Recursos Adicionales

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgREST API](https://postgrest.org/)
