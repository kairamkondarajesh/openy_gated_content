<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* profiles/contrib/openy/themes/openy_themes/openy_rose/templates/node/node--landing-page--full.html.twig */
class __TwigTemplate_bffe977ab41312a91f2515e5cd45228e1553bd0126197bb3c53322d7ce7125ce extends \Twig\Template
{
    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $tags = ["set" => 70, "if" => 101];
        $filters = ["clean_class" => 75, "trim" => 101, "render" => 101, "escape" => 102];
        $functions = ["create_attribute" => 70, "attach_library" => 112];

        try {
            $this->sandbox->checkSecurity(
                ['set', 'if'],
                ['clean_class', 'trim', 'render', 'escape'],
                ['create_attribute', 'attach_library']
            );
        } catch (SecurityError $e) {
            $e->setSourceContext($this->getSourceContext());

            if ($e instanceof SecurityNotAllowedTagError && isset($tags[$e->getTagName()])) {
                $e->setTemplateLine($tags[$e->getTagName()]);
            } elseif ($e instanceof SecurityNotAllowedFilterError && isset($filters[$e->getFilterName()])) {
                $e->setTemplateLine($filters[$e->getFilterName()]);
            } elseif ($e instanceof SecurityNotAllowedFunctionError && isset($functions[$e->getFunctionName()])) {
                $e->setTemplateLine($functions[$e->getFunctionName()]);
            }

            throw $e;
        }

    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        // line 70
        $context["header_attributes"] = $this->env->getExtension('Drupal\Core\Template\TwigExtension')->createAttribute();
        // line 73
        $context["header_classes"] = [0 => "landing-header", 1 => \Drupal\Component\Utility\Html::getClass($this->sandbox->ensureToStringAllowed($this->getAttribute($this->getAttribute(        // line 75
($context["node"] ?? null), "field_lp_layout", []), "value", [])))];
        // line 78
        echo "
";
        // line 79
        $context["header_content_attributes"] = $this->env->getExtension('Drupal\Core\Template\TwigExtension')->createAttribute();
        // line 81
        $context["header_content_classes"] = [0 => "content"];
        // line 85
        $context["content_attributes"] = $this->env->getExtension('Drupal\Core\Template\TwigExtension')->createAttribute();
        // line 87
        $context["content_classes"] = [0 => "landing-content", 1 => \Drupal\Component\Utility\Html::getClass($this->sandbox->ensureToStringAllowed($this->getAttribute($this->getAttribute(        // line 89
($context["node"] ?? null), "field_lp_layout", []), "value", [])))];
        // line 92
        echo "
";
        // line 94
        $context["sidebar_attributes"] = $this->env->getExtension('Drupal\Core\Template\TwigExtension')->createAttribute();
        // line 96
        $context["sidebar_classes"] = [0 => "landing-sidebar"];
        // line 100
        echo "
";
        // line 101
        if ( !twig_test_empty(twig_trim_filter($this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar($this->getAttribute(($context["content"] ?? null), "field_header_content", []))))) {
            // line 102
            echo "  <div";
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["header_attributes"] ?? null), "addClass", [0 => ($context["header_classes"] ?? null)], "method")), "html", null, true);
            echo ">
    <div";
            // line 103
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["content_attributes"] ?? null)), "html", null, true);
            echo ">
      <div class=\"main\">
        ";
            // line 105
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["content"] ?? null), "field_header_content", [])), "html", null, true);
            echo "
      </div>
    </div>
  </div>
";
        }
        // line 110
        echo "
";
        // line 111
        if (($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) == "two_column_fixed")) {
            // line 112
            echo "  ";
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->env->getExtension('Drupal\Core\Template\TwigExtension')->attachLibrary("openy_rose/landing"), "html", null, true);
            echo "
";
        }
        // line 114
        echo "
";
        // line 115
        if (($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) != "one_column_clean")) {
            // line 116
            echo "<div class=\"container\">
  <div class=\"row\">
    ";
        }
        // line 119
        echo "
    ";
        // line 120
        if ( !twig_test_empty(twig_trim_filter($this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar($this->getAttribute(($context["content"] ?? null), "field_content", []))))) {
            // line 121
            echo "      <div";
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["content_attributes"] ?? null), "addClass", [0 => ($context["content_classes"] ?? null)], "method")), "html", null, true);
            echo ">
        ";
            // line 122
            if (($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) == "one_column")) {
                // line 123
                echo "        <div class=\"main-region col-sm-12\">
          ";
            }
            // line 125
            echo "          ";
            if ((($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) == "two_column") || ($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) == "two_column_fixed"))) {
                // line 126
                echo "          <div class=\"two-column\">
            <div class=\"main-region col-sm-8\">
              ";
            }
            // line 129
            echo "              ";
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["content"] ?? null), "field_content", [])), "html", null, true);
            echo "

              ";
            // line 131
            if ( !twig_test_empty($this->getAttribute(($context["content"] ?? null), "addthis", []))) {
                // line 132
                echo "                ";
                echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["content"] ?? null), "addthis", [])), "html", null, true);
                echo "
              ";
            }
            // line 134
            echo "
              ";
            // line 135
            if ((($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) == "two_column") || ($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) == "two_column_fixed"))) {
                // line 136
                echo "            </div>
            <div class=\"sidebar-region col-sm-4\">
              ";
            }
            // line 139
            echo "              ";
            if ($this->getAttribute($this->getAttribute(($context["content"] ?? null), "field_sidebar_content", []), 0, [])) {
                // line 140
                echo "              <aside";
                echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["sidebar_attributes"] ?? null), "addClass", [0 => ($context["sidebar_classes"] ?? null)], "method")), "html", null, true);
                echo ">
                ";
                // line 141
                echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["content"] ?? null), "field_sidebar_content", [])), "html", null, true);
                echo "
              </aside>
              ";
            }
            // line 144
            echo "              ";
            if ((($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) == "two_column") || ($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) == "two_column_fixed"))) {
                // line 145
                echo "            </div>
          </div>
          ";
            }
            // line 148
            echo "          ";
            if (($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) == "one_column")) {
                // line 149
                echo "        </div>
        ";
            }
            // line 151
            echo "      </div>
    ";
        }
        // line 153
        echo "
    ";
        // line 154
        if (($this->getAttribute($this->getAttribute(($context["node"] ?? null), "field_lp_layout", []), "value", []) != "one_column_clean")) {
            // line 155
            echo "  </div>
</div>
";
        }
        // line 158
        echo "
";
        // line 159
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["content"] ?? null), "field_bottom_content", [])), "html", null, true);
        echo "
";
    }

    public function getTemplateName()
    {
        return "profiles/contrib/openy/themes/openy_themes/openy_rose/templates/node/node--landing-page--full.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  217 => 159,  214 => 158,  209 => 155,  207 => 154,  204 => 153,  200 => 151,  196 => 149,  193 => 148,  188 => 145,  185 => 144,  179 => 141,  174 => 140,  171 => 139,  166 => 136,  164 => 135,  161 => 134,  155 => 132,  153 => 131,  147 => 129,  142 => 126,  139 => 125,  135 => 123,  133 => 122,  128 => 121,  126 => 120,  123 => 119,  118 => 116,  116 => 115,  113 => 114,  107 => 112,  105 => 111,  102 => 110,  94 => 105,  89 => 103,  84 => 102,  82 => 101,  79 => 100,  77 => 96,  75 => 94,  72 => 92,  70 => 89,  69 => 87,  67 => 85,  65 => 81,  63 => 79,  60 => 78,  58 => 75,  57 => 73,  55 => 70,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Source("", "profiles/contrib/openy/themes/openy_themes/openy_rose/templates/node/node--landing-page--full.html.twig", "/var/www/docroot/profiles/contrib/openy/themes/openy_themes/openy_rose/templates/node/node--landing-page--full.html.twig");
    }
}
