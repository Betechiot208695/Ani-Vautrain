import { FunctionDeclaration, Type, ToolParameterSchema } from '../types'; // Fix: Import ToolParameterSchema

export const web_crawler_declaration: FunctionDeclaration = {
  name: "web_crawler",
  description: "Visite une URL spécifique pour récupérer son contenu. Strict.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["url"],
    properties: {
      url: { type: Type.STRING, description: "L'URL complète. Doit commencer par http:// ou https://." },
      reason: { type: Type.STRING, description: "Justification de l'accès." },
      strict: { type: Type.BOOLEAN, description: "Si vrai, valide l'URL avant exécution." },
      extract: { // Fix: `extract` property itself is a ToolParameterSchema
        type: Type.ARRAY,
        items: { type: Type.STRING, enum: ["text", "links", "images", "metadata", "scripts"] }, // `items` is also a ToolParameterSchema
        description: "Données à extraire."
      }
    }
  }
};

export const web_search_declaration: FunctionDeclaration = {
  name: "web_search",
  description: "Effectue une recherche par mots-clés sur un moteur de recherche.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["query"],
    properties: {
      query: { type: Type.STRING, description: "Les mots-clés de la recherche." },
      engine: { // Fix: `engine` property itself is a ToolParameterSchema
        type: Type.STRING,
        enum: ["google", "bing", "duckduckgo"], // `enum` is directly on this ToolParameterSchema
        description: "Moteur de recherche."
      },
      num_results: { type: Type.INTEGER, description: "Nombre de résultats." }
    }
  }
};

export const save_note_declaration: FunctionDeclaration = {
  name: "save_note",
  description: "Sauvegarde du texte dans une note persistante.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["title", "content"],
    properties: {
      title: { type: Type.STRING, description: "Titre de la note." },
      content: { type: Type.STRING, description: "Contenu complet." },
      category: { // Fix: `category` property itself is a ToolParameterSchema
        type: Type.STRING,
        enum: ["personnel", "travail", "projet_famille", "code", "urgent"],
        description: "Catégorie."
      }
    }
  }
};

export const calendar_event_declaration: FunctionDeclaration = {
  name: "calendar_event",
  description: "Crée un événement dans le calendrier.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["event_title", "start_time"],
    properties: {
      event_title: { type: Type.STRING, description: "Nom de l'événement." },
      start_time: { type: Type.STRING, description: "Date/Heure début (ISO 8601)." },
      duration_minutes: { type: Type.INTEGER, description: "Durée en minutes." }
    }
  }
};

export const send_secure_email_declaration: FunctionDeclaration = {
  name: "send_secure_email",
  description: "Envoie un email sécurisé à un destinataire.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["recipient", "subject", "body"],
    properties: {
      recipient: { type: Type.STRING, description: "Email destinataire valide." },
      subject: { type: Type.STRING, description: "Objet de l'email." },
      body: { type: Type.STRING, description: "Contenu du message." }
    }
  }
};

export const generate_image_declaration: FunctionDeclaration = {
  name: "generate_image",
  description: "Génère une image basée sur une description textuelle.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["prompt"],
    properties: {
      prompt: { type: Type.STRING, description: "Description de l'image." },
      style: { // Fix: `style` property itself is a ToolParameterSchema
        type: Type.STRING,
        enum: ["photorealistic", "cyberpunk", "anime", "sketch"],
        description: "Style artistique."
      },
      aspect_ratio: { // Fix: `aspect_ratio` property itself is a ToolParameterSchema
        type: Type.STRING,
        enum: ["1:1", "16:9", "9:16"],
        description: "Format."
      }
    }
  }
};

export const json_processor_declaration: FunctionDeclaration = {
  name: "json_processor",
  description: "Valide, formate ou minifie du JSON.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["json_content", "action"],
    properties: {
      json_content: { type: Type.STRING, description: "JSON brut." },
      action: { // Fix: `action` property itself is a ToolParameterSchema
        type: Type.STRING,
        enum: ["validate", "beautify", "minify"],
        description: "Action à faire."
      }
    }
  }
};

export const save_web_file_declaration: FunctionDeclaration = {
  name: "save_web_file",
  description: "Crée/MAJ un fichier web (HTML, CSS, JS).",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["filename", "content", "language"],
    properties: {
      filename: { type: Type.STRING, description: "Nom fichier (.html, .css, .js)." },
      content: { type: Type.STRING, description: "Code complet." },
      language: { // Fix: `language` property itself is a ToolParameterSchema
        type: Type.STRING,
        enum: ["html", "css", "javascript"],
        description: "Langage."
      }
    }
  }
};

export const preview_web_component_declaration: FunctionDeclaration = {
  name: "preview_web_component",
  description: "Simule le rendu d'un composant web.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["html_code"],
    properties: {
      html_code: { type: Type.STRING, description: "Structure HTML." },
      css_code: { type: Type.STRING, description: "Style CSS." },
      js_code: { type: Type.STRING, description: "Logique JS." }
    }
  }
};

export const python_interpreter_declaration: FunctionDeclaration = {
  name: "python_interpreter",
  description: "Exécute du code Python.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["code"],
    properties: {
      code: { type: Type.STRING, description: "Script Python." },
      timeout: { type: Type.INTEGER, description: "Temps max (sec)." }
    }
  }
};

export const write_generic_code_declaration: FunctionDeclaration = {
  name: "write_generic_code",
  description: "Écrit un fichier de code source complet.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["filename", "code_content"],
    properties: {
      filename: { type: Type.STRING, description: "Nom fichier avec extension." },
      code_content: { type: Type.STRING, description: "Code source." },
      add_comments: { type: Type.BOOLEAN, description: "Ajout de commentaires." }
    }
  }
};

export const analyze_and_fix_code_declaration: FunctionDeclaration = {
  name: "analyze_and_fix_code",
  description: "Analyse et corrige des erreurs de code.",
  parameters: { // Fix: `parameters` is a ToolParameterSchema
    type: Type.OBJECT,
    required: ["broken_code", "language"],
    properties: {
      broken_code: { type: Type.STRING, description: "Code erroné." },
      language: { // Fix: `language` property itself is a ToolParameterSchema
        type: Type.STRING,
        enum: ["python", "javascript", "html", "css", "cpp", "java"],
        description: "Langage."
      },
      output_mode: { // Fix: `output_mode` property itself is a ToolParameterSchema
        type: Type.STRING,
        enum: ["fixed_code_only", "explanation_with_code"],
        description: "Format de réponse."
      }
    }
  }
};

export const ALL_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  web_crawler_declaration,
  web_search_declaration,
  save_note_declaration,
  calendar_event_declaration,
  send_secure_email_declaration,
  generate_image_declaration,
  json_processor_declaration,
  save_web_file_declaration,
  preview_web_component_declaration,
  python_interpreter_declaration,
  write_generic_code_declaration,
  analyze_and_fix_code_declaration,
];