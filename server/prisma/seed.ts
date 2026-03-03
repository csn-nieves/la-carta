import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const password = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'bartender@mixology.app' },
    update: {},
    create: {
      email: 'bartender@mixology.app',
      name: 'The Bartender',
      password,
    },
  });

  console.log(`Created user: ${user.email}`);

  const cocktails = [
    {
      name: 'Old Fashioned',
      glassware: 'Rocks Glass',
      directions:
        'Place sugar cube in an Old Fashioned glass. Saturate with bitters and add a splash of water. Muddle until dissolved. Fill the glass with ice cubes and add bourbon. Stir gently. Garnish with an orange twist and a cherry.',
      ingredients: [
        { name: 'Bourbon', volume: '2 oz' },
        { name: 'Sugar Cube', volume: '1' },
        { name: 'Angostura Bitters', volume: '2 dashes' },
        { name: 'Water', volume: 'Splash' },
      ],
    },
    {
      name: 'Margarita',
      glassware: 'Coupe Glass',
      directions:
        'Rub the rim of a coupe glass with lime and dip in salt. Combine tequila, lime juice, and Cointreau in a shaker with ice. Shake vigorously for 15 seconds. Strain into the prepared glass. Garnish with a lime wheel.',
      ingredients: [
        { name: 'Tequila Blanco', volume: '2 oz' },
        { name: 'Fresh Lime Juice', volume: '1 oz' },
        { name: 'Cointreau', volume: '1 oz' },
        { name: 'Salt', volume: 'For rim' },
      ],
    },
    {
      name: 'Negroni',
      glassware: 'Rocks Glass',
      directions:
        'Add gin, Campari, and sweet vermouth to a mixing glass filled with ice. Stir for 30 seconds until well-chilled. Strain into a rocks glass over a large ice cube. Garnish with an orange peel.',
      ingredients: [
        { name: 'Gin', volume: '1 oz' },
        { name: 'Campari', volume: '1 oz' },
        { name: 'Sweet Vermouth', volume: '1 oz' },
      ],
    },
    {
      name: 'Daiquiri',
      glassware: 'Coupe Glass',
      directions:
        'Combine rum, lime juice, and simple syrup in a cocktail shaker with ice. Shake vigorously for 10-15 seconds. Double strain into a chilled coupe glass. Garnish with a lime wheel.',
      ingredients: [
        { name: 'White Rum', volume: '2 oz' },
        { name: 'Fresh Lime Juice', volume: '1 oz' },
        { name: 'Simple Syrup', volume: '3/4 oz' },
      ],
    },
    {
      name: 'Manhattan',
      glassware: 'Coupe Glass',
      directions:
        'Combine rye whiskey, sweet vermouth, and bitters in a mixing glass with ice. Stir for 30 seconds until well-chilled. Strain into a chilled coupe glass. Garnish with a brandied cherry.',
      ingredients: [
        { name: 'Rye Whiskey', volume: '2 oz' },
        { name: 'Sweet Vermouth', volume: '1 oz' },
        { name: 'Angostura Bitters', volume: '2 dashes' },
      ],
    },
    {
      name: 'Mojito',
      glassware: 'Collins Glass',
      directions:
        'Gently muddle mint leaves with simple syrup and lime juice in a Collins glass. Add rum and fill the glass with ice. Top with soda water and stir gently to combine. Garnish with a sprig of mint and a lime wheel.',
      ingredients: [
        { name: 'White Rum', volume: '2 oz' },
        { name: 'Fresh Lime Juice', volume: '1 oz' },
        { name: 'Simple Syrup', volume: '3/4 oz' },
        { name: 'Fresh Mint Leaves', volume: '8-10' },
        { name: 'Soda Water', volume: 'Top' },
      ],
    },
    {
      name: 'Whiskey Sour',
      glassware: 'Rocks Glass',
      directions:
        'Combine bourbon, lemon juice, and simple syrup in a shaker. Add egg white if desired. Dry shake (without ice) for 10 seconds, then add ice and shake again for 15 seconds. Strain into a rocks glass over ice. Garnish with an orange peel and cherry.',
      ingredients: [
        { name: 'Bourbon', volume: '2 oz' },
        { name: 'Fresh Lemon Juice', volume: '3/4 oz' },
        { name: 'Simple Syrup', volume: '3/4 oz' },
        { name: 'Egg White', volume: '1 (optional)' },
      ],
    },
    {
      name: 'Espresso Martini',
      glassware: 'Coupe Glass',
      directions:
        'Combine vodka, coffee liqueur, and freshly brewed espresso in a shaker with ice. Shake vigorously for 15 seconds to create a nice foam. Double strain into a chilled coupe glass. Garnish with three coffee beans.',
      ingredients: [
        { name: 'Vodka', volume: '2 oz' },
        { name: 'Coffee Liqueur', volume: '1/2 oz' },
        { name: 'Fresh Espresso', volume: '1 oz' },
        { name: 'Simple Syrup', volume: '1/4 oz' },
      ],
    },
  ];

  for (const cocktail of cocktails) {
    const existing = await prisma.cocktail.findFirst({
      where: { name: cocktail.name, createdById: user.id },
    });

    if (!existing) {
      await prisma.cocktail.create({
        data: {
          name: cocktail.name,
          glassware: cocktail.glassware,
          directions: cocktail.directions,
          createdById: user.id,
          ingredients: {
            create: cocktail.ingredients,
          },
        },
      });
      console.log(`Created cocktail: ${cocktail.name}`);
    } else {
      console.log(`Skipped (exists): ${cocktail.name}`);
    }
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
