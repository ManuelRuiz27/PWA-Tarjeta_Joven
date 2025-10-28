import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedUser = {
  nombre: string;
  apellidos: string;
  curp: string;
  fechaNacimiento: string;
  colonia: string;
  telefono?: string;
  municipio?: string;
};

const testUsers: SeedUser[] = [
  {
    nombre: 'Laura',
    apellidos: 'Martinez Juarez',
    curp: 'MAJL010203MJCLRS01',
    fechaNacimiento: '2001-02-03',
    colonia: 'Centro',
    telefono: '3311112233',
    municipio: 'Guadalajara',
  },
  {
    nombre: 'Diego',
    apellidos: 'Hernandez Soto',
    curp: 'HESD990715HJCRRT02',
    fechaNacimiento: '1999-07-15',
    colonia: 'Colomos',
    telefono: '3322223344',
    municipio: 'Zapopan',
  },
  {
    nombre: 'Valeria',
    apellidos: 'Lopez Medina',
    curp: 'LOMV020909MJCPRL03',
    fechaNacimiento: '2002-09-09',
    colonia: 'Oblatos',
    telefono: '3333334455',
    municipio: 'Tlaquepaque',
  },
  {
    nombre: 'Carlos',
    apellidos: 'Ramirez Torres',
    curp: 'RATC000420HJCNRS04',
    fechaNacimiento: '2000-04-20',
    colonia: 'Mirador',
    telefono: '3344445566',
    municipio: 'Guadalajara',
  },
  {
    nombre: 'Fernanda',
    apellidos: 'Gomez Ruiz',
    curp: 'GORF010811MJCMZN05',
    fechaNacimiento: '2001-08-11',
    colonia: 'Chapalita',
    telefono: '3355556677',
    municipio: 'Zapopan',
  },
];

async function seedUsers() {
  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { curp: user.curp },
      update: {
        nombre: user.nombre,
        apellidos: user.apellidos,
        fechaNacimiento: new Date(user.fechaNacimiento),
        colonia: user.colonia,
        telefono: user.telefono,
        municipio: user.municipio,
        isActive: true,
      },
      create: {
        nombre: user.nombre,
        apellidos: user.apellidos,
        curp: user.curp,
        fechaNacimiento: new Date(user.fechaNacimiento),
        colonia: user.colonia,
        telefono: user.telefono,
        municipio: user.municipio,
        isActive: true,
      },
    });
  }
}

seedUsers()
  .then(async () => {
    console.log(`Seeded ${testUsers.length} test users.`);
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Failed to seed test users', error);
    await prisma.$disconnect();
    process.exit(1);
  });
