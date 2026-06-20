import { createClient } from "@insforge/sdk";

const baseUrl = import.meta.env.VITE_INSFORGE_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

export const backendConfigured = Boolean(baseUrl && anonKey);

export const insforge = backendConfigured
  ? createClient({ baseUrl, anonKey })
  : null;

function requireClient() {
  if (!insforge) {
    throw new Error("SERVICE_UNAVAILABLE");
  }
  return insforge;
}

export async function getCurrentAccount() {
  if (!insforge) return null;
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error) return null;
  return data?.user ?? null;
}

export async function signUpAccount({ email, password, firstname, lastname }) {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    name: `${firstname} ${lastname}`
  });
  if (error) throw error;
  return data;
}

export async function verifyAccount(email, otp) {
  const client = requireClient();
  const { data, error } = await client.auth.verifyEmail({ email, otp });
  if (error) throw error;
  return data;
}

export async function signInAccount(identifier, password) {
  const client = requireClient();
  const email = identifier.trim().toLowerCase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle(redirectTo) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    redirectTo
  });
  if (error) throw error;
  return data;
}

export async function sendPasswordReset(email) {
  const client = requireClient();
  const { data, error } = await client.auth.sendResetPasswordEmail({ email });
  if (error) throw error;
  return data;
}

export async function exchangePasswordResetCode(email, code) {
  const client = requireClient();
  const { data, error } = await client.auth.exchangeResetPasswordToken({ email, code });
  if (error) throw error;
  return data;
}

export async function resetAccountPassword(newPassword, token) {
  const client = requireClient();
  const { data, error } = await client.auth.resetPassword({ newPassword, otp: token });
  if (error) throw error;
  return data;
}

export function getFriendlyAuthError(error, context = "account") {
  const code = String(error?.error || error?.code || "").toUpperCase();
  const status = Number(error?.statusCode || error?.status || 0);
  const message = String(error?.message || "").toLowerCase();

  if (code.includes("INVALID_CREDENTIALS") || status === 401 || message.includes("invalid login")) {
    return "Adresse email ou mot de passe incorrect.";
  }
  if (
    status === 403
    || code.includes("EMAIL_NOT_VERIFIED")
    || message.includes("not verified")
    || message.includes("vérifi")
  ) {
    return "Ton adresse email doit être vérifiée avant la connexion.";
  }
  if (code.includes("USER_ALREADY_EXISTS") || status === 409 || message.includes("already")) {
    return "Un compte existe déjà avec cette adresse email.";
  }
  if (code.includes("RATE") || status === 429) {
    return "Trop de tentatives. Patiente quelques minutes avant de réessayer.";
  }
  if (code.includes("OTP") || message.includes("code") || context === "verification") {
    return "Le code est invalide ou a expiré. Demande un nouveau code.";
  }
  if (context === "signup") {
    return "Impossible de créer le compte pour le moment. Réessaie dans quelques instants.";
  }
  if (context === "login") {
    return "Connexion momentanément indisponible. Réessaie dans quelques instants.";
  }
  return "Une erreur est survenue. Réessaie dans quelques instants.";
}

export async function signOutAccount() {
  if (!insforge) return;
  const { error } = await insforge.auth.signOut();
  if (error) throw error;
}

export async function loadRemotePlayer(userId) {
  const client = requireClient();
  const [{ data: player, error: playerError }, { data: progress, error: progressError }] = await Promise.all([
    client.database.from("players").select("*").eq("user_id", userId).maybeSingle(),
    client.database.from("player_progress").select("*").eq("user_id", userId).maybeSingle()
  ]);
  if (playerError) throw playerError;
  if (progressError) throw progressError;
  return { player, progress };
}

export async function createRemotePlayer(user, player) {
  const client = requireClient();
  const { error: playerError } = await client.database.from("players").insert([{
    user_id: user.id,
    firstname: player.firstname,
    lastname: player.lastname,
    email: user.email,
    whatsapp: player.phone,
    consent_at: new Date().toISOString()
  }]);
  if (playerError) throw playerError;

  const { error: progressError } = await client.database.from("player_progress").insert([{
    user_id: user.id
  }]);
  if (progressError) throw progressError;
}

export async function saveRemoteProgress(userId, state) {
  if (!insforge || !userId) return;
  const { error } = await insforge.database.from("player_progress").update({
    xp: state.xp,
    lives: state.lives,
    streak: state.streak,
    unlocked_world: state.unlockedWorld,
    completed_worlds: state.completedWorlds,
    profile_milestones: state.profileMilestones,
    active_session: state.activeSession,
    simulation_state: state.career,
    last_played_at: new Date().toISOString()
  }).eq("user_id", userId);
  if (error) throw error;
}

export async function saveWorldAttempt(userId, attempt) {
  if (!insforge || !userId) return;
  const { error } = await insforge.database.from("world_attempts").insert([{
    user_id: userId,
    world_index: attempt.worldIndex,
    score_percent: attempt.percentage,
    correct_answers: attempt.correctCount,
    total_questions: attempt.total,
    passed: attempt.passed,
    timed_out_count: attempt.timedOutCount
  }]);
  if (error) throw error;
}
