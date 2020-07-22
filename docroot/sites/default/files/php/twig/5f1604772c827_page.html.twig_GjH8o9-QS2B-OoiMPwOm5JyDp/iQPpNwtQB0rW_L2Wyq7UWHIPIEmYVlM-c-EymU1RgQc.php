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

/* profiles/contrib/openy/themes/openy_themes/openy_rose/templates/page/page.html.twig */
class __TwigTemplate_aa9e0632f147093208e5bebe79776933e882c9a37e6b170f84d0c6d43f4523df extends \Twig\Template
{
    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = [
            'page_logo' => [$this, 'block_page_logo'],
            'page_logo_2' => [$this, 'block_page_logo_2'],
            'pagecontent' => [$this, 'block_pagecontent'],
            'footer_image_link' => [$this, 'block_footer_image_link'],
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $tags = ["block" => 55, "if" => 72, "set" => 148];
        $filters = ["escape" => 48, "t" => 61, "raw" => 152];
        $functions = ["file_url" => 150];

        try {
            $this->sandbox->checkSecurity(
                ['block', 'if', 'set'],
                ['escape', 't', 'raw'],
                ['file_url']
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
        // line 48
        echo "<div class=\"layout-container ";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["layout_class"] ?? null)), "html", null, true);
        echo "\">

  <div class=\"top-navs navbar-fixed-top visible-xs visible-sm\" data-spy=\"affix\" data-offset-top=\"165\">
    <div class=\"nav-global navbar-default navbar\">
      <div class=\"container\">
        <div class=\"row\">
          <div class=\"page-head__logo\">
            ";
        // line 55
        $this->displayBlock('page_logo', $context, $blocks);
        // line 58
        echo "          </div>

          <button aria-controls=\"sidebar\" aria-expanded=\"false\" class=\"collapsed navbar-toggle visible-xs visible-sm\" data-target=\"#sidebar\" data-toggle=\"collapse\" type=button>
            <div class=sr-only>";
        // line 61
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar(t("Navigation menu"));
        echo "</div>
            <span class=icon-bar></span>
            <span class=icon-bar></span>
            <span class=icon-bar></span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div id=\"sidebar\" class=\"sidebar sidebar-left collapse width\" aria-hidden=\"true\">
    ";
        // line 72
        if (($context["display_search"] ?? null)) {
            // line 73
            echo "      <div class=\"search-form-wrapper col-xs-12\">
        <form method=\"get\" action=\"";
            // line 74
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["search_results_path"] ?? null)), "html", null, true);
            echo "\">
          <input type=\"search\" name=\"";
            // line 75
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["search_key"] ?? null)), "html", null, true);
            echo "\" class=\"search-input\" placeholder=\"";
            echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar(t("Search"));
            echo "\">
          <input type=\"submit\" value=\"Search\">
        </form>
      </div>
    ";
        }
        // line 80
        echo "    <div class=\"col-xs-12 page-head__top-menu\">
      ";
        // line 81
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute($this->getAttribute(($context["page"] ?? null), "mobile_menu", []), "openy_rose_useraccountmenu", [])), "html", null, true);
        echo "
      ";
        // line 82
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute($this->getAttribute(($context["page"] ?? null), "mobile_menu", []), "openy_rose_gtranslate_mobile", [])), "html", null, true);
        echo "
    </div>
    <div class=\"col-xs-12 page-head__main-menu nav-home\">
      ";
        // line 85
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute($this->getAttribute(($context["page"] ?? null), "mobile_menu", []), "openy_rose_mainnavigation", [])), "html", null, true);
        echo "
    </div>
  </div>

  <div class=\"viewport\">
    <header id=\"page-head\" class=\"page-head\">
      <div class=\"top-navs navbar-fixed-top hidden-xs hidden-sm\" data-spy=\"affix\" data-offset-top=\"165\">
        <div class=\"nav-global navbar-ymcags navbar\">
          <div class=\"container\">
            <div class=\"row\">
              <div class=\"page-head__logo\">
                ";
        // line 96
        $this->displayBlock('page_logo_2', $context, $blocks);
        // line 99
        echo "              </div>

              <a class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".sidebar-left\">
                <span class=\"icon-bar\"></span>
                <span class=\"icon-bar\"></span>
                <span class=\"icon-bar\"></span>
              </a>

              <div class=\"col-md-12 header-content hidden-xs\">
                <div class=\"clearfix page-head__top-menu\">
                  ";
        // line 109
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "secondary_menu", [])), "html", null, true);
        echo "
                </div>
                <div class=\"clearfix page-head__main-menu nav-home\">
                  ";
        // line 112
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "primary_menu", [])), "html", null, true);
        echo "
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>

    ";
        // line 122
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "header", [])), "html", null, true);
        echo "

    ";
        // line 124
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "breadcrumb", [])), "html", null, true);
        echo "

    ";
        // line 126
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "highlighted", [])), "html", null, true);
        echo "

    ";
        // line 128
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "help", [])), "html", null, true);
        echo "

    <main role=\"main\">
      <a id=\"main-content\" tabindex=\"-1\"></a>";
        // line 132
        echo "
      <div class=\"layout-content\">
        ";
        // line 134
        $this->displayBlock('pagecontent', $context, $blocks);
        // line 137
        echo "      </div>";
        // line 138
        echo "    </main>

    <div class=\"pre-footer\">
      ";
        // line 141
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "pre_footer", [])), "html", null, true);
        echo "
    </div>

    <footer class=\"footer\">
      <div class=\"container\">
        <div class=\"col-sm-2 col-xs-4 hidden-sm hidden-md\">
          ";
        // line 147
        $this->displayBlock('footer_image_link', $context, $blocks);
        // line 154
        echo "        </div>
        <div class=\"col-xs-8 col-sm-12 col-md-7 col-lg-6\">
          <div class=\"footer__nav row\">
            ";
        // line 157
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "footer_menus", [])), "html", null, true);
        echo "
          </div>
        </div>
        <div class=\"col-xs-12 col-sm-7 col-md-5 col-lg-4 footer__social\">
          ";
        // line 161
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "footer_social", [])), "html", null, true);
        echo "
        </div>
      </div>
    </footer>

  </div>";
        // line 167
        echo "
</div>";
    }

    // line 55
    public function block_page_logo($context, array $blocks = [])
    {
        // line 56
        echo "              ";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "logo", [])), "html", null, true);
        echo "
            ";
    }

    // line 96
    public function block_page_logo_2($context, array $blocks = [])
    {
        // line 97
        echo "                  ";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "logo", [])), "html", null, true);
        echo "
                ";
    }

    // line 134
    public function block_pagecontent($context, array $blocks = [])
    {
        // line 135
        echo "          ";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed($this->getAttribute(($context["page"] ?? null), "content", [])), "html", null, true);
        echo "
        ";
    }

    // line 147
    public function block_footer_image_link($context, array $blocks = [])
    {
        // line 148
        echo "            ";
        $context["background_image"] = "";
        // line 149
        echo "            ";
        if (($context["footer_logo"] ?? null)) {
            // line 150
            echo "              ";
            $context["background_image"] = ((" style='background-image: url(" . call_user_func_array($this->env->getFunction('file_url')->getCallable(), [$this->sandbox->ensureToStringAllowed(($context["footer_logo"] ?? null))])) . ")'");
            // line 151
            echo "            ";
        }
        // line 152
        echo "            <a href=\"";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["front_page"] ?? null)), "html", null, true);
        echo "\" class=\"footer__brand brand\" title=\"";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar(t("Go to homepage"));
        echo "\"";
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->renderVar($this->sandbox->ensureToStringAllowed(($context["background_image"] ?? null)));
        echo "></a>
          ";
    }

    public function getTemplateName()
    {
        return "profiles/contrib/openy/themes/openy_themes/openy_rose/templates/page/page.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  285 => 152,  282 => 151,  279 => 150,  276 => 149,  273 => 148,  270 => 147,  263 => 135,  260 => 134,  253 => 97,  250 => 96,  243 => 56,  240 => 55,  235 => 167,  227 => 161,  220 => 157,  215 => 154,  213 => 147,  204 => 141,  199 => 138,  197 => 137,  195 => 134,  191 => 132,  185 => 128,  180 => 126,  175 => 124,  170 => 122,  157 => 112,  151 => 109,  139 => 99,  137 => 96,  123 => 85,  117 => 82,  113 => 81,  110 => 80,  100 => 75,  96 => 74,  93 => 73,  91 => 72,  77 => 61,  72 => 58,  70 => 55,  59 => 48,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Source("", "profiles/contrib/openy/themes/openy_themes/openy_rose/templates/page/page.html.twig", "/var/www/docroot/profiles/contrib/openy/themes/openy_themes/openy_rose/templates/page/page.html.twig");
    }
}
