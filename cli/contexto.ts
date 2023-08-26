import { dbCollection } from '../src/lib/constants';
import 'dotenv/config'

import clientPromise from '../src/lib/mongodb';
import { v4 as uuidv4 } from "uuid";
import { Command } from 'commander'
import { User } from '../src/models/user';
const program = new Command();

program
  .name('contexto-cli')
  .description('CLI to manage your Charlee installation')
  .version('0.0.1');

program.command('user-create')
  .description('Creates a new user')
  .argument('<email>', 'E-mail of user')
  .argument('<name>', 'Name of user')
  .argument('<role>', 'Role of user')
  .action(async (email, name, role, options) => {
    if (!["admin", "user"].includes(role)) {
      console.log("Invalid role: admin|user");
      process.exit();
    }
    const client = await clientPromise;
    const user: User = {
      userId: uuidv4(),
      email: email.toLowerCase(),
      role,
      name,
      enabled: true,
      type : "user"
    }
    const existingUser = await client.db().collection(dbCollection.user).findOne({ email: user.email });
    if (existingUser) {
      console.error("User already exists");
      return
    }
    await client.db().collection(dbCollection.user).insertOne(user);
    console.log("User created");
    console.log(JSON.stringify(user, null, 2))
    process.exit();

  });

program.parse();