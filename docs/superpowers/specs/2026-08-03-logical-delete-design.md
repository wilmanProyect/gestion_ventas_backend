# Especificación de Diseño: Eliminación Lógica de Roles y Usuarios y Gestión de Estado

Este documento detalla la especificación para implementar la eliminación lógica (Soft Delete) de roles y usuarios en el sistema, así como la funcionalidad de cambiar el estado (activo/inactivo) de un usuario.

## 1. Objetivos y Decisiones de Diseño

1. **Uso de Soft Delete nativo de TypeORM:** Se agregará la columna `deletedAt` decorada con `@DeleteDateColumn()` a las entidades `UserOrmEntity` y `RoleOrmEntity`. Esto asegura que TypeORM filtre automáticamente los registros eliminados de las consultas normales de lectura.
2. **Pérdida automática de relaciones:** Cuando un rol se elimina de manera lógica, la fila correspondiente en la tabla intermedia `user_roles` no se elimina físicamente, pero el rol no se cargará en las relaciones de los usuarios activos. Por lo tanto, el usuario perderá automáticamente los permisos asociados a dicho rol.
3. **Unicidad de correo electrónico condicional en PostgreSQL:** El correo electrónico del usuario solo debe ser único entre los usuarios **activos** (no eliminados). Si un usuario se elimina de manera lógica, se debe poder reutilizar su correo. Se removerá la restricción de unicidad estándar y se agregará un índice condicional:
   `CREATE UNIQUE INDEX unique_active_email ON users (email) WHERE deleted_at IS NULL;`
4. **Unicidad de nombre de rol condicional:** De la misma manera, el nombre de un rol solo debe ser único entre los roles activos:
   `CREATE UNIQUE INDEX unique_active_role_name ON roles (name) WHERE deleted_at IS NULL;`
5. **Gestión de Estado de Usuario (Activo/Inactivo):** Se añadirá la funcionalidad para alternar o actualizar directamente el estado `isActive` de un usuario sin eliminarlo lógicamente. Un usuario inactivo no podrá iniciar sesión en la aplicación.

---

## 2. Cambios Propuestos por Componente

### A. Módulo de Usuarios

#### [MODIFY] [user.model.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/users/domain/models/user.model.ts)
*   Agregar `deletedAt: Date | null` como campo opcional en el constructor (valor por defecto: `null`).
*   Agregar método `delete(): void` que establece `deletedAt = new Date()` y también desactiva al usuario (`isActive = false`).
*   Agregar getter `getDeletedAt(): Date | null`.
*   *(Nota: Los métodos `activate()` y `deactivate()` para alternar `isActive` ya existen en el modelo).*

#### [MODIFY] [user.orm-entity.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/users/infrastructure/persistence/entities/user.orm-entity.ts)
*   Agregar la columna `@DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date;`.
*   Cambiar `@Column({ unique: true }) email: string;` a `@Column() email: string;`.
*   Agregar el decorador `@Index('unique_active_email', ['email'], { unique: true, where: '"deleted_at" IS NULL' })` a nivel de clase.

#### [MODIFY] [user.mapper.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/users/infrastructure/persistence/mappers/user.mapper.ts)
*   Mapear `deletedAt` en `toDomain` y `toOrm`.

#### [MODIFY] [user.typeorm.repository.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/users/infrastructure/persistence/repositories/user.typeorm.repository.ts)
*   Modificar el método `delete(id: string): Promise<void>` para usar `this.repository.softDelete(id)` en lugar de `delete(id)`.

#### [NEW] [update-user-status.dto.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/users/application/dtos/update-user-status.dto.ts)
*   Crear un DTO simple con la propiedad `isActive: boolean`, validada mediante `@IsBoolean()`.

#### [NEW] [delete-user.use-case.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/users/application/use-cases/delete-user.use-case.ts)
*   Crear el caso de uso `DeleteUserUseCase` que busque al usuario, verifique su existencia, y llame al método `delete(id)` del repositorio.

#### [NEW] [update-user-status.use-case.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/users/application/use-cases/update-user-status.use-case.ts)
*   Crear el caso de uso `UpdateUserStatusUseCase` que busque al usuario por ID, llame a `user.activate()` o `user.deactivate()` según la solicitud, y persista el cambio con `userRepository.save(user)`.

#### [MODIFY] [user.controller.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/users/infrastructure/controllers/user.controller.ts)
*   Agregar el método `@Delete(':id')` que invoca a `DeleteUserUseCase`.
*   Agregar el método `@Patch(':id/status')` que recibe `UpdateUserStatusDto` e invoca a `UpdateUserStatusUseCase`.

#### [MODIFY] [users.module.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/users/users.module.ts)
*   Registrar `DeleteUserUseCase` y `UpdateUserStatusUseCase` en la lista de proveedores (`providers`).

---

### B. Módulo de Roles y Permisos

#### [MODIFY] [role.model.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/roles-permissions/domain/models/role.model.ts)
*   Agregar `deletedAt: Date | null` en el constructor.
*   Agregar getter `getDeletedAt(): Date | null`.
*   Agregar método `delete(): void` que establece `deletedAt = new Date()`.

#### [MODIFY] [role.orm-entity.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/roles-permissions/infrastructure/persistence/entities/role.orm-entity.ts)
*   Agregar la columna `@DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date;`.
*   Cambiar `@Column({ unique: true }) name: string;` a `@Column() name: string;`.
*   Agregar el decorador `@Index('unique_active_role_name', ['name'], { unique: true, where: '"deleted_at" IS NULL' })` a nivel de clase.

#### [MODIFY] [role.mapper.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/roles-permissions/infrastructure/persistence/mappers/role.mapper.ts)
*   Mapear `deletedAt` en `toDomain` y `toOrm`.

#### [MODIFY] [role.typeorm.repository.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/roles-permissions/infrastructure/persistence/repositories/role.typeorm.repository.ts)
*   Modificar el método `delete(id: string): Promise<void>` para usar `this.roleRepository.softDelete(id)` en lugar de `delete(id)`.

#### [NEW] [delete-role.use-case.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/roles-permissions/application/use-cases/delete-role.use-case.ts)
*   Crear el caso de uso `DeleteRoleUseCase` que busque el rol, verifique su existencia (evitando eliminar roles críticos como 'Admin'), y llame al método `delete(id)` del repositorio.

#### [MODIFY] [role.controller.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/roles-permissions/infrastructure/controllers/role.controller.ts)
*   Agregar el método `@Delete(':id')` que invoca a `DeleteRoleUseCase`.

#### [MODIFY] [roles-permissions.module.ts](file:///c:/Users/VICTUS/Documents/Work/Agroptima/DESAROLLO%20SISTEMAS/Gestion_Ventas/gestion_ventas_backend/src/modules/roles-permissions/roles-permissions.module.ts)
*   Registrar `DeleteRoleUseCase` en la lista de proveedores.

---

## 3. Plan de Verificación

### Pruebas Manuales
1. **Verificar migración automática:** Iniciar la app en desarrollo (`pnpm run start:dev`) y confirmar en los logs de TypeORM que se crean las columnas `deleted_at` y los índices condicionales en PostgreSQL.
2. **Prueba de eliminación de usuario:**
   - Crear un usuario mediante `POST /users`.
   - Eliminar el usuario con `DELETE /users/:id`.
   - Confirmar en la base de datos que `deleted_at` tiene la fecha actual y `is_active` es `false`.
   - Intentar iniciar sesión (`POST /auth/login`) con las credenciales de ese usuario. Debe denegar el acceso.
   - Listar usuarios (`GET /users`). El usuario eliminado no debe aparecer.
   - Registrar un nuevo usuario con el mismo correo electrónico. Debe permitirlo sin fallos de unicidad.
3. **Prueba de cambio de estado de usuario:**
   - Cambiar el estado del usuario activo a inactivo usando `PATCH /users/:id/status` con `{ "isActive": false }`.
   - Listar usuarios y verificar que el usuario aparece como `isActive: false` (pero no está eliminado, `deletedAt` sigue nulo).
   - Intentar iniciar sesión con este usuario inactivo. Debe denegar el acceso con el mensaje "El usuario se encuentra inactivo".
   - Cambiar el estado de vuelta a activo usando `{ "isActive": true }`.
   - Iniciar sesión de nuevo. Debe permitir el acceso exitosamente.
4. **Prueba de eliminación de rol:**
   - Crear un rol con `POST /roles`.
   - Asignar el rol a un usuario mediante `PUT /users/:id/roles`.
   - Eliminar el rol con `DELETE /roles/:id`.
   - Listar roles (`GET /roles`). El rol eliminado no debe aparecer.
   - Obtener el usuario asignado. Confirmar que el rol ya no aparece en su lista de roles activos.
   - Intentar eliminar el rol `Admin`. El sistema debe retornar un error indicando que es un rol crítico del sistema.
