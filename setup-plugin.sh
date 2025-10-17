#!/bin/bash

# WordPress Plugin Installation & Testing Script
# Dieses Script hilft bei der Installation und dem Testen des Nostr Calendar Blocks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_SOURCE="$SCRIPT_DIR/plugin/nostr-calendar-block"
PLUGIN_NAME="nostr-calendar-block"

# Farben für Terminal-Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ Nostr Calendar Block - Setup & Test Helper${NC}            ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_requirements() {
    echo ""
    print_info "Checking requirements..."
    
    if [ ! -d "$PLUGIN_SOURCE" ]; then
        print_error "Plugin-Verzeichnis nicht gefunden: $PLUGIN_SOURCE"
        exit 1
    fi
    
    if [ ! -f "$PLUGIN_SOURCE/nostr-calendar-block.php" ]; then
        print_error "Plugin-Datei nicht gefunden: $PLUGIN_SOURCE/nostr-calendar-block.php"
        exit 1
    fi
    
    if [ ! -d "$PLUGIN_SOURCE/languages" ]; then
        print_error "Languages-Verzeichnis nicht gefunden"
        exit 1
    fi
    
    print_success "Alle Anforderungen erfüllt"
}

create_plugin_zip() {
    echo ""
    print_info "Creating plugin ZIP..."
    
    cd "$SCRIPT_DIR/plugin"
    zip -q -r "nostr-calendar-block-1.0.0.zip" "nostr-calendar-block/" -x "*.DS_Store" ".git/*"
    
    if [ -f "nostr-calendar-block-1.0.0.zip" ]; then
        print_success "Plugin ZIP erstellt: $(pwd)/nostr-calendar-block-1.0.0.zip"
        ls -lh "nostr-calendar-block-1.0.0.zip"
    else
        print_error "Fehler beim Erstellen der ZIP-Datei"
        exit 1
    fi
}

validate_plugin() {
    echo ""
    print_info "Validating plugin structure..."
    
    local errors=0
    local warnings=0
    
    # Check plugin file header
    if grep -q "Plugin Name:" "$PLUGIN_SOURCE/nostr-calendar-block.php"; then
        print_success "Plugin header gefunden"
    else
        print_error "Plugin header nicht gefunden"
        errors=$((errors + 1))
    fi
    
    # Check text domain
    if grep -q 'Text Domain: nostr-calendar-block' "$PLUGIN_SOURCE/nostr-calendar-block.php"; then
        print_success "Text Domain korrekt"
    else
        print_warning "Text Domain könnte fehlerhaft sein"
        warnings=$((warnings + 1))
    fi
    
    # Check domain path
    if [ -d "$PLUGIN_SOURCE/languages" ]; then
        print_success "Domain Path Verzeichnis existiert"
    else
        print_error "Domain Path Verzeichnis existiert nicht"
        errors=$((errors + 1))
    fi
    
    # Check README.md
    if [ -f "$PLUGIN_SOURCE/README.md" ]; then
        if grep -q "Tested up to:" "$PLUGIN_SOURCE/README.md"; then
            print_success "README.md: Tested up to Header vorhanden"
        else
            print_warning "README.md: Tested up to Header fehlt"
            warnings=$((warnings + 1))
        fi
        
        if grep -q "License:" "$PLUGIN_SOURCE/README.md"; then
            print_success "README.md: License Header vorhanden"
        else
            print_warning "README.md: License Header fehlt"
            warnings=$((warnings + 1))
        fi
    else
        print_error "README.md nicht gefunden"
        errors=$((errors + 1))
    fi
    
    echo ""
    echo "Validierungsergebnis: Errors=$errors, Warnings=$warnings"
    
    if [ $errors -gt 0 ]; then
        print_error "Plugin-Validierung FEHLGESCHLAGEN"
        return 1
    else
        print_success "Plugin-Validierung erfolgreich"
        return 0
    fi
}

show_wordpress_paths() {
    echo ""
    print_info "Häufige WordPress Installationspfade:"
    echo ""
    echo "  macOS (Local by Flywheel / Local):"
    echo "    /Users/USERNAME/Local Sites/SITENAME/app/public/wp-content/plugins/"
    echo ""
    echo "  macOS (MAMP):"
    echo "    /Applications/MAMP/htdocs/SITENAM/wp-content/plugins/"
    echo ""
    echo "  macOS (Homebrew):"
    echo "    /usr/local/var/www/wordpress/wp-content/plugins/"
    echo ""
    echo "  Linux:"
    echo "    /var/www/html/wp-content/plugins/"
    echo "    /home/USER/public_html/wp-content/plugins/"
    echo ""
    echo "  Windows (XAMPP):"
    echo "    C:\\xampp\\htdocs\\wordpress\\wp-content\\plugins\\"
    echo ""
}

install_to_wordpress() {
    echo ""
    print_info "Installiere Plugin zu WordPress..."
    
    read -p "Geben Sie den Pfad zu WordPress wp-content/plugins/ ein: " wp_plugins_path
    
    if [ ! -d "$wp_plugins_path" ]; then
        print_error "Verzeichnis nicht gefunden: $wp_plugins_path"
        return 1
    fi
    
    local target_path="$wp_plugins_path/$PLUGIN_NAME"
    
    if [ -d "$target_path" ]; then
        print_warning "Plugin existiert bereits unter $target_path"
        read -p "Überschreiben? (j/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Jj]$ ]]; then
            return 1
        fi
        rm -rf "$target_path"
    fi
    
    cp -r "$PLUGIN_SOURCE" "$target_path"
    
    if [ -d "$target_path" ]; then
        print_success "Plugin installiert zu: $target_path"
        return 0
    else
        print_error "Fehler beim Installieren des Plugins"
        return 1
    fi
}

test_plugin_locally() {
    echo ""
    print_info "Plugin lokal testen..."
    echo ""
    echo "1. Gehen Sie zu Ihrer WordPress Admin-Seite"
    echo "2. Navigieren Sie zu Plugins"
    echo "3. Finden Sie 'Nostr Calendar Block'"
    echo "4. Klicken Sie auf 'Activate'"
    echo ""
    echo "Nach der Aktivierung:"
    echo "1. Erstellen Sie einen neuen Beitrag/Seite"
    echo "2. Öffnen Sie den Gutenberg Editor"
    echo "3. Klicken Sie auf '+' um einen Block hinzuzufügen"
    echo "4. Suchen Sie nach 'Nostr Event Wall'"
    echo "5. Testen Sie die Block-Einstellungen"
    echo ""
}

show_plugin_checker_help() {
    echo ""
    print_info "WordPress.org Plugin Checker verwenden..."
    echo ""
    echo "Option 1: Online Plugin Checker"
    echo "  1. Gehen Sie zu: https://wordpress.org/plugins/developers/"
    echo "  2. Wählen Sie 'Plugin Checker'"
    echo "  3. Laden Sie die ZIP-Datei hoch"
    echo ""
    echo "Option 2: Manuell prüfen"
    echo "  • Text Domain: Sollte 'nostr-calendar-block' sein"
    echo "  • Domain Path: Sollte '/languages' sein"
    echo "  • README.md: Sollte Tested up to, License, Stable tag haben"
    echo ""
}

main() {
    print_header
    echo ""
    
    echo "Was möchten Sie tun?"
    echo ""
    echo "1) Plugin-Struktur validieren"
    echo "2) Plugin ZIP erstellen"
    echo "3) Plugin zu WordPress installieren"
    echo "4) Plugin lokal testen"
    echo "5) Plugin Checker-Hilfe anzeigen"
    echo "6) Alle Schritte ausführen (empfohlen)"
    echo "0) Abbrechen"
    echo ""
    
    read -p "Wählen Sie eine Option (0-6): " choice
    
    case $choice in
        1)
            check_requirements
            validate_plugin
            ;;
        2)
            check_requirements
            validate_plugin
            create_plugin_zip
            ;;
        3)
            check_requirements
            show_wordpress_paths
            install_to_wordpress
            ;;
        4)
            test_plugin_locally
            ;;
        5)
            show_plugin_checker_help
            ;;
        6)
            check_requirements
            validate_plugin
            create_plugin_zip
            show_wordpress_paths
            read -p "Möchten Sie jetzt zu WordPress installieren? (j/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Jj]$ ]]; then
                install_to_wordpress
            fi
            test_plugin_locally
            show_plugin_checker_help
            ;;
        0)
            print_info "Abbruch."
            exit 0
            ;;
        *)
            print_error "Ungültige Auswahl"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Fertig!"
}

# Run main function
main
