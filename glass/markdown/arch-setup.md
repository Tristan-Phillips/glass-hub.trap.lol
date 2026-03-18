# Arch Linux // Zero-Trust Workstation

**Author:** trap  
**Last Updated:** March 2026  
**Philosophy:** Minimal footprint, configuration-as-code, and strict manual control over automated background processes.

---

## 1. The Core Userland

We actively avoid GNU legacy bloat where modern, high-performance Rust and Go alternatives exist.

### Essential CLI Tooling

Install the core visual and text-editing stack:

```bash
sudo pacman -S micro starship bat lsd chezmoi
```

#### Aliases (~/.bashrc or ~/.zshrc)

Map the legacy commands to their modern counterparts to maintain muscle memory while upgrading the output:
Bash

```bash
# Modern Listing
alias ls='lsd -la'
alias tree='lsd --tree'

# Modern Reading
alias cat='bat --style=plain'
alias less='bat --paging=always'

# Text Editor
alias nano='micro'
```

## 2. Shell Initialization (Starship)

We use starship for a unified, high-context terminal prompt across all machines (local Arch and remote Debian VPS).

Add the init script to the bottom of your shell configuration file:
Bash

```bash
# Initialize Starship Prompt
eval "$(starship init bash)"
```

## 3. Configuration Management (The "Pickup & Drop Off" Method)

Live syncing (like Nextcloud or Syncthing) for dotfiles introduces unwanted state changes. We use chezmoi attached to our private Forgejo instance for strict, manual version control.

### Initialize Chezmoi

```bash
# Initialize with the self-hosted Forgejo repository
chezmoi init [https://git.trap.lol/trap/dotfiles.git](https://git.trap.lol/trap/dotfiles.git)
```

### Daily Operations Workflow

Instead of hoping a background sync works, we explicitly command changes:

1. Add a new config: chezmoi add ~/.config/kitty/kitty.conf
2. Edit a tracked file: chezmoi edit ~/.bashrc
3. See what changed: chezmoi diff
4. Apply changes locally: chezmoi apply
5. Push to Forgejo: cd ~/.local/share/chezmoi && git push

## 4. SSH Tunneling Aliases

To interface with the Debian Zero-Trust infrastructure without exposing ports to the public web, we map local ports through the SSH connection.

Add these aliases to your shell profile for rapid VPS administration:

```bash
# Boot the Dockge and Netdata tunnels
alias vps-tunnels="ssh -L 5001:127.0.0.1:5001 -L 19999:127.0.0.1:19999 trap-vps"
```

Once executed, open <http://localhost:5001> in LibreWolf to access the orchestration UI.
>> "Be precise and remain critical of all until proven, yet do not be stubborn or closed-minded."
