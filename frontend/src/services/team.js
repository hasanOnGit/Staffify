/**
 * Team Service
 * Handles all Team related API calls
 * This layer isolates API logic from UI components
 */

const API_BASE_URL = "http://localhost:5000/api"; 
// Replace later with env variable

/* ----------------------------------
   TEAMS
---------------------------------- */

/**
 * Get all teams
 */
export async function getTeams() {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`);
    if (!response.ok) {
      throw new Error("Failed to fetch teams");
    }
    return await response.json();
  } catch (error) {
    console.error("getTeams error:", error);
    throw error;
  }
}

/**
 * Get single team details by ID
 */
export async function getTeamById(teamId) {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch team details");
    }
    return await response.json();
  } catch (error) {
    console.error("getTeamById error:", error);
    throw error;
  }
}

/**
 * Create new team
 */
export async function createTeam(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to create team");
    }

    return await response.json();
  } catch (error) {
    console.error("createTeam error:", error);
    throw error;
  }
}

/**
 * Update team details
 */
export async function updateTeam(teamId, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to update team");
    }

    return await response.json();
  } catch (error) {
    console.error("updateTeam error:", error);
    throw error;
  }
}

/* ----------------------------------
   TEAM MANAGERS
---------------------------------- */

/**
 * Assign manager to team
 */
export async function addTeamManager(teamId, employeeId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/teams/${teamId}/managers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add team manager");
    }

    return await response.json();
  } catch (error) {
    console.error("addTeamManager error:", error);
    throw error;
  }
}

/**
 * Remove manager from team
 */
export async function removeTeamManager(teamId, employeeId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/teams/${teamId}/managers/${employeeId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove team manager");
    }

    return await response.json();
  } catch (error) {
    console.error("removeTeamManager error:", error);
    throw error;
  }
}

/* ----------------------------------
   TEAM MEMBERS
---------------------------------- */

/**
 * Add member to team
 */
export async function addTeamMember(teamId, payload) {
  /**
   * payload example:
   * {
   *   employeeId: number,
   *   role: "Developer"
   * }
   */
  try {
    const response = await fetch(
      `${API_BASE_URL}/teams/${teamId}/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add team member");
    }

    return await response.json();
  } catch (error) {
    console.error("addTeamMember error:", error);
    throw error;
  }
}

/**
 * Remove member from team
 */
export async function removeTeamMember(teamId, employeeId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/teams/${teamId}/members/${employeeId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove team member");
    }

    return await response.json();
  } catch (error) {
    console.error("removeTeamMember error:", error);
    throw error;
  }
}
