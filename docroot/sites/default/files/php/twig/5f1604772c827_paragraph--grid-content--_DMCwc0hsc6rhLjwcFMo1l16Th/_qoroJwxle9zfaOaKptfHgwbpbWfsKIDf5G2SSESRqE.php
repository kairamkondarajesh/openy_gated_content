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

/* profiles/contrib/openy/themes/openy_themes/openy_rose/templates/paragraph/paragraph--grid-content--default.html.twig */
class __TwigTemplate_61bd6e850a889463415ace4f6a3a3cc8accbb1cdb4e8c1d14dc4a6073caefb93 extends \Twig\Template
{
    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $tags = ["set" => 40, "if" => 49, "for" => 57];
        $filters = ["clean_class" => 44, "trim" => 48, "render" => 48, "escape" => 56];
        $functions = [];

        try {
            $this->sandbox->checkSecurity(
                ['set', 'if', 'for'],
                ['clean_class', 'trim', 'render', 'escape'],
                []
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
        $context["classes"] = [0 => "paragraph", 1 => "row-eq-height", 2 => "paragraph--column-in-a-grid", 3 => ("paragraph--type--" . \Drupal\Component\Utility\Html::getClass($this->sandbox->ensureToStringAllowed($this->getAttribute(        // line 44
($context["paragraph"] ?? null), "bundle", [])))), 4 => ((        // line 45
($context["view_mode"] ?? null)) ? (("paragraph--view-mode--" . \Drupal\Component\Utility\Html::getClass($this->sandbox->ensureToStringAllowed(($context["view_mode"] ?? null))))) : (""))];
        // line 48
        $context["grid_style"] = twig_trim_filter($this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar($this->sandbox->ensureToStringAllowed($this->getAttribute(($context["content"] ?? null), "field_prgf_grid_style", []))));
        // line 49
        if ((($context["grid_style"] ?? null) == "2")) {
            // line 50
            echo "  ";
            $context["item_class"] = "col-xs-12 col-sm-6 row-eq-height";
        } elseif ((        // line 51
($context["grid_style"] ?? null) == "3")) {
            // line 52
            echo "  ";
            $context["item_class"] = "col-xs-12 col-sm-4 row-eq-height";
        } elseif ((        // line 53
($context["grid_style"] ?? null) == "4")) {
            // line 54
            echo "  ";
            $context["item_class"] = "col-xs-12 col-sm-3 row-eq-height";
        }
        // line 56
        echo "<div";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["attributes"] ?? null), "addClass", [0 => ($context["classes"] ?? null)], "method")), "html", null, true);
        echo ">
  ";
        // line 57
        $context['_parent'] = $context;
        $context['_seq'] = twig_ensure_traversable($this->getAttribute(($context["content"] ?? null), "field_grid_columns", []));
        foreach ($context['_seq'] as $context["key"] => $context["item"]) {
            // line 58
            echo "    ";
            if (preg_match("/^\\d+\$/", $context["key"])) {
                // line 59
                echo "    <div class=\"";
                echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["item_class"] ?? null)), "html", null, true);
                echo "\">
      ";
                // line 60
                echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($context["item"]), "html", null, true);
                echo "
    </div>
    ";
            }
            // line 63
            echo "  ";
        }
        $_parent = $context['_parent'];
        unset($context['_seq'], $context['_iterated'], $context['key'], $context['item'], $context['_parent'], $context['loop']);
        $context = array_intersect_key($context, $_parent) + $_parent;
        // line 64
        echo "</div>
";
    }

    public function getTemplateName()
    {
        return "profiles/contrib/openy/themes/openy_themes/openy_rose/templates/paragraph/paragraph--grid-content--default.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  106 => 64,  100 => 63,  94 => 60,  89 => 59,  86 => 58,  82 => 57,  77 => 56,  73 => 54,  71 => 53,  68 => 52,  66 => 51,  63 => 50,  61 => 49,  59 => 48,  57 => 45,  56 => 44,  55 => 40,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Source("", "profiles/contrib/openy/themes/openy_themes/openy_rose/templates/paragraph/paragraph--grid-content--default.html.twig", "/var/www/docroot/profiles/contrib/openy/themes/openy_themes/openy_rose/templates/paragraph/paragraph--grid-content--default.html.twig");
    }
}
