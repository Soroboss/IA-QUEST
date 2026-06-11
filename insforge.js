import { createClient } from "@insforge/sdk";

const baseUrl = import.meta.env.VITE_INSFORGE_URL;
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY;

export const backendConfigured = Boolean(baseUrl && anonKey);

export const insforge = backendConfigured
  ? createClient({ baseUrl, anonKey })
  : null;

function requireClient() {
  if (!insforge) {
    throw new Error("La connexion à InsForge n’est pas configurée.");
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
  let email = identifier.trim().toLowerCase();

  if (!email.includes("@")) {
    const { data: resolvedEmail, error: resolveError } = await client.database.rpc(
      "resolve_login_email",
      { login_value: identifier }
    );
    if (resolveError) throw resolveError;
    email = typeof resolvedEmail === "string"
      ? resolvedEmail
      : Array.isArray(resolvedEmail)
        ? resolvedEmail[0]
        : resolvedEmail?.resolve_login_email;
    if (!email) throw new Error("Aucun compte ne correspond à ce numéro WhatsApp.");
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
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
