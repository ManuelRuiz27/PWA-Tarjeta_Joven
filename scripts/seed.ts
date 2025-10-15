import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const merchants = [
  {
    nombre: 'Cafetería La Plaza',
    categoria: 'Alimentos',
    municipio: 'Guadalajara',
    descuento: '10% en consumo',
    direccion: 'Av. Juárez 120',
    horario: 'Lun-Dom 08:00-22:00',
    descripcion: 'Cafetería con opciones veganas',
    lat: 20.6767,
    lng: -103.3476,
  },
  {
    nombre: 'Librería Lectores',
    categoria: 'Cultura',
    municipio: 'Guadalajara',
    descuento: '15% en libros',
    direccion: 'C. Morelos 45',
    horario: 'Lun-Sáb 10:00-20:00',
    descripcion: 'Eventos de lectura todos los viernes',
    lat: 20.6736,
    lng: -103.3444,
  },
  {
    nombre: 'Gimnasio Energía Joven',
    categoria: 'Deporte',
    municipio: 'Zapopan',
    descuento: '20% en membresías',
    direccion: 'Blvd. Puerta de Hierro 505',
    horario: 'Lun-Dom 06:00-23:00',
    descripcion: 'Clases grupales incluidas',
    lat: 20.7182,
    lng: -103.4068,
  },
  {
    nombre: 'Cine Estelar',
    categoria: 'Entretenimiento',
    municipio: 'Zapopan',
    descuento: '2x1 en miércoles',
    direccion: 'Av. Patria 3200',
    horario: 'Lun-Dom 12:00-23:00',
    descripcion: 'Salas VIP disponibles',
    lat: 20.7102,
    lng: -103.4012,
  },
  {
    nombre: 'Museo de Arte Contemporáneo',
    categoria: 'Cultura',
    municipio: 'Tlaquepaque',
    descuento: 'Entrada gratuita',
    direccion: 'C. Independencia 200',
    horario: 'Mar-Dom 09:00-18:00',
    descripcion: 'Exposiciones temporales cada mes',
    lat: 20.6405,
    lng: -103.2932,
  },
  {
    nombre: 'Restaurante Sabores de Jalisco',
    categoria: 'Alimentos',
    municipio: 'Tlaquepaque',
    descuento: '12% en platillos',
    direccion: 'Av. Niños Héroes 88',
    horario: 'Lun-Dom 11:00-23:00',
    descripcion: 'Platillos típicos jalisciences',
    lat: 20.6401,
    lng: -103.3115,
  },
  {
    nombre: 'Papelería Escolar',
    categoria: 'Servicios',
    municipio: 'Tonalá',
    descuento: '10% en útiles escolares',
    direccion: 'C. Hidalgo 78',
    horario: 'Lun-Sáb 09:00-21:00',
    descripcion: 'Impresiones y copias disponibles',
  },
  {
    nombre: 'Parque Acuático Aventura',
    categoria: 'Entretenimiento',
    municipio: 'Tonalá',
    descuento: '20% en entradas',
    direccion: 'Km 5 Carretera Tonalá-El Salto',
    horario: 'Sab-Dom 09:00-18:00',
    descripcion: 'Atracciones para toda la familia',
    lat: 20.635,
    lng: -103.233,
  },
  {
    nombre: 'Tienda EcoModa',
    categoria: 'Moda',
    municipio: 'Guadalajara',
    descuento: '15% en prendas sustentables',
    direccion: 'Av. Vallarta 3456',
    horario: 'Lun-Sáb 10:00-21:00',
    descripcion: 'Ropa ecológica y local',
  },
  {
    nombre: 'Heladería Dulce Frío',
    categoria: 'Alimentos',
    municipio: 'Zapopan',
    descuento: '2x1 en helados',
    direccion: 'Av. Guadalupe 1400',
    horario: 'Lun-Dom 11:00-22:00',
    descripcion: 'Sabores artesanales',
  },
  {
    nombre: 'Centro de Idiomas Lingua',
    categoria: 'Educación',
    municipio: 'Guadalajara',
    descuento: '20% en cursos',
    direccion: 'Av. Chapultepec 230',
    horario: 'Lun-Vie 08:00-21:00',
    descripcion: 'Cursos de inglés, francés y alemán',
  },
  {
    nombre: 'Estudio de Danza Ritmo',
    categoria: 'Deporte',
    municipio: 'Zapopan',
    descuento: '15% en mensualidades',
    direccion: 'Av. Universidad 2000',
    horario: 'Lun-Sáb 08:00-20:00',
    descripcion: 'Clases de baile urbano y contemporáneo',
  },
  {
    nombre: 'Clínica Dental Sonrisas',
    categoria: 'Salud',
    municipio: 'Tlaquepaque',
    descuento: 'Consulta a mitad de precio',
    direccion: 'Av. Revolución 56',
    horario: 'Lun-Sáb 09:00-19:00',
    descripcion: 'Especialistas en ortodoncia',
  },
  {
    nombre: 'Taller de Bicicletas Rueda Libre',
    categoria: 'Servicios',
    municipio: 'Guadalajara',
    descuento: '10% en refacciones',
    direccion: 'C. Colonias 150',
    horario: 'Lun-Sáb 09:00-19:00',
    descripcion: 'Mantenimiento de bicicletas',
  },
  {
    nombre: 'Coworking Nexus',
    categoria: 'Servicios',
    municipio: 'Zapopan',
    descuento: '15% en membresías',
    direccion: 'Av. Naciones Unidas 5670',
    horario: 'Lun-Vie 08:00-20:00',
    descripcion: 'Espacios colaborativos y salas de juntas',
  },
  {
    nombre: 'Teatro Independiente',
    categoria: 'Cultura',
    municipio: 'Guadalajara',
    descuento: 'Boletos al 50% los jueves',
    direccion: 'C. Degollado 300',
    horario: 'Jue-Dom 16:00-23:00',
    descripcion: 'Obras locales y nacionales',
  },
  {
    nombre: 'Restaurante Veggie Life',
    categoria: 'Alimentos',
    municipio: 'Zapopan',
    descuento: '15% en menú vegano',
    direccion: 'Av. Patria 500',
    horario: 'Lun-Dom 11:00-22:00',
    descripcion: 'Opciones veganas y vegetarianas',
  },
  {
    nombre: 'Centro de Bienestar Integral',
    categoria: 'Salud',
    municipio: 'Guadalajara',
    descuento: 'Paquetes de masajes al 30%',
    direccion: 'Av. López Mateos Sur 2500',
    horario: 'Lun-Sáb 09:00-21:00',
    descripcion: 'Spa y masajes terapéuticos',
  },
  {
    nombre: 'Tienda GamerZone',
    categoria: 'Entretenimiento',
    municipio: 'Tlaquepaque',
    descuento: '10% en videojuegos',
    direccion: 'Plaza Centro Sur Local 12',
    horario: 'Lun-Dom 11:00-21:00',
    descripcion: 'Torneos los fines de semana',
  },
  {
    nombre: 'Escuela de Música Armonía',
    categoria: 'Educación',
    municipio: 'Guadalajara',
    descuento: '20% en clases',
    direccion: 'Av. Américas 700',
    horario: 'Lun-Sáb 08:00-20:00',
    descripcion: 'Clases individuales y grupales',
  },
];

const users = [
  {
    nombre: 'Ana',
    apellidos: 'García López',
    curp: 'GALA000101MJCRRN01',
    fechaNacimiento: new Date(2000, 0, 1),
    colonia: 'Centro',
    telefono: '3312345678',
    municipio: 'Guadalajara',
  },
  {
    nombre: 'Luis',
    apellidos: 'Martínez Pérez',
    curp: 'MAPL990202HJCRRS02',
    fechaNacimiento: new Date(1999, 1, 2),
    colonia: 'Americana',
    telefono: '3334567890',
    municipio: 'Zapopan',
  },
  {
    nombre: 'Sofía',
    apellidos: 'Ramírez Díaz',
    curp: 'RADS010303MJCRRS03',
    fechaNacimiento: new Date(2001, 2, 3),
    colonia: 'Oblatos',
    telefono: '3323456789',
    municipio: 'Tlaquepaque',
  },
];

async function seed() {
  await prisma.merchant.createMany({ data: merchants });
  await prisma.user.createMany({
    data: users.map((user) => ({
      ...user,
      isActive: true,
    })),
    skipDuplicates: true,
  });
}

seed()
  .then(async () => {
    console.log('Seed completed');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
