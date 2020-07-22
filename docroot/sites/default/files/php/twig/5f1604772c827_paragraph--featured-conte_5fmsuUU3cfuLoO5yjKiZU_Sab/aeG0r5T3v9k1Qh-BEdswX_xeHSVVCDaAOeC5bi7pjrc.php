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

/* profiles/contrib/openy/themes/openy_themes/openy_rose/templates/paragraph/paragraph--featured-content--default.html.twig */
class __TwigTemplate_08be7985c4f9ce3d3ba0d0de3f9123a0cb502d65580445f7363c5e854a43fc18 extends \Twig\Template
{
    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $tags = ["set" => 40, "if" => 61, "for" => 69];
        $filters = ["clean_class" => 43, "escape" => 47];
        $functions = ["attach_library" => 59];

        try {
            $this->sandbox->checkSecurity(
                ['set', 'if', 'for'],
                ['clean_class', 'escape'],
                ['attach_library']
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
        // line 40
        $context["classes"] = [0 => "paragraph", 1 => "featured-content", 2 => ("paragraph--type--" . \Drupal\Component\Utility\Html::getClass($this->sandbox->ensureToStringAllowed($this->getAttribute(        // line 43
($context["paragraph"] ?? null), "bundle", [])))), 3 => ((        // line 44
($context["view_mode"] ?? null)) ? (("paragraph--view-mode--" . \Drupal\Component\Utility\Html::getClass($this->sandbox->ensureToStringAllowed(($context["view_mode"] ?? null))))) : (""))];
        // line 47
        echo "<div";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["attributes"] ?? null), "addClass", [0 => ($context["classes"] ?? null)], "method")), "html", null, true);
        echo ">
  <h2 class=\"h1\">
    ";
        // line 49
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["content"] ?? null), "field_prgf_headline", [])), "html", null, true);
        echo "
  </h2>
  <div class=\"description\">
      ";
        // line 52
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["content"] ?? null), "field_prgf_description", [])), "html", null, true);
        echo "
  </div>

  ";
        // line 59
        echo "  ";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->env->getExtension('Drupal\Core\Template\TwigExtension')->attachLibrary("openy_rose/featured_slider"), "html", null, true);
        echo "
  <div class=\"";
        // line 60
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, ("wrapper-" . \Drupal\Component\Utility\Html::getClass($this->sandbox->ensureToStringAllowed($this->getAttribute($this->getAttribute(($context["content"] ?? null), "field_prgf_fc_clm_description", []), "#field_name", [], "array")))), "html", null, true);
        echo " row\">
    ";
        // line 61
        if (($this->getAttribute($this->getAttribute($this->getAttribute(($context["content"] ?? null), "field_prgf_grid_style", []), 0, []), "#markup", [], "array") == "2")) {
            // line 62
            echo "      ";
            $context["item_class"] = "col-xs-12 col-sm-6";
            // line 63
            echo "    ";
        } elseif (($this->getAttribute($this->getAttribute($this->getAttribute(($context["content"] ?? null), "field_prgf_grid_style", []), 0, []), "#markup", [], "array") == "3")) {
            // line 64
            echo "      ";
            $context["item_class"] = "col-xs-12 col-sm-4";
            // line 65
            echo "    ";
        } elseif (($this->getAttribute($this->getAttribute($this->getAttribute(($context["content"] ?? null), "field_prgf_grid_style", []), 0, []), "#markup", [], "array") == "4")) {
            // line 66
            echo "      ";
            $context["item_class"] = "col-xs-12 col-sm-3";
            // line 67
            echo "    ";
        }
        // line 68
        echo "
    ";
        // line 69
        $context['_parent'] = $context;
        $context['_seq'] = twig_ensure_traversable($this->getAttribute(($context["content"] ?? null), "field_prgf_fc_clm_description", []));
        foreach ($context['_seq'] as $context["key"] => $context["item"]) {
            // line 70
            echo "      ";
            if (preg_match("/^\\d+\$/", $context["key"])) {
                // line 71
                echo "        <div class=\"";
                echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["item_class"] ?? null)), "html", null, true);
                echo " row-eq-height\">
          ";
                // line 72
                echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($context["item"]), "html", null, true);
                echo "
        </div>
      ";
            }
            // line 75
            echo "    ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['key'], $context['item'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        // line 76
        echo "  </div>

  <div class=\"align-center\">
    ";
        // line 79
        if ($this->getAttribute($this->getAttribute($this->getAttribute(($context["content"] ?? null), "field_prgf_link", []), 0, []), "#title", [], "array")) {
            // line 80
            echo "      <div class=\"btn btn-default btn-link blue\">
        ";
            // line 81
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["content"] ?? null), "field_prgf_link", [])), "html", null, true);
            echo "
      </div>
    ";
        }
        // line 84
        echo "  </div>
</div>
";
    }

    public function getTemplateName()
    {
        return "profiles/contrib/openy/themes/openy_themes/openy_rose/templates/paragraph/paragraph--featured-content--default.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  149 => 84,  143 => 81,  140 => 80,  138 => 79,  133 => 76,  127 => 75,  121 => 72,  116 => 71,  113 => 70,  109 => 69,  106 => 68,  103 => 67,  100 => 66,  97 => 65,  94 => 64,  91 => 63,  88 => 62,  86 => 61,  82 => 60,  77 => 59,  71 => 52,  65 => 49,  59 => 47,  57 => 44,  56 => 43,  55 => 40,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Source("", "profiles/contrib/openy/themes/openy_themes/openy_rose/templates/paragraph/paragraph--featured-content--default.html.twig", "/var/www/docroot/profiles/contrib/openy/themes/openy_themes/openy_rose/templates/paragraph/paragraph--featured-content--default.html.twig");
    }
}
