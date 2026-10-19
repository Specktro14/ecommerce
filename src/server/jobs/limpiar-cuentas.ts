import { Temporal } from "@js-temporal/polyfill";

import { AuthUserRepo } from "../modules/clientes/clientes.repo";

export async function ejecutarLimpiezaDiaria() {
  const ahora = Temporal.Now.zonedDateTimeISO("UTC");
  const usuarios = await AuthUserRepo.getExpiredUsers(ahora);
  if (usuarios.length === 0) {
    return;
  }

  let borrados = 0;
  for (const usuario of usuarios) {
    await AuthUserRepo.deleteFisico({ id: usuario.id });
    borrados++;
  }
}
