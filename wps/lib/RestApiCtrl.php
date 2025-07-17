<?php

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

namespace LizmapWPS\WPS;

class RestApiCtrl extends \jController implements \jIRestController
{
    /**
     * GET Template to be inherited.
     */
    public function get(): object
    {
        $rep = $this->getResponse('json');

        return Error::setError($rep, 501);
    }

    /**
     * POST Template to be inherited.
     */
    public function post(): object
    {
        $rep = $this->getResponse('json');

        return Error::setError($rep, 501);
    }

    /**
     * PUT Template to be inherited.
     */
    public function put()
    {
        $rep = $this->getResponse('json');

        return Error::setError($rep, 501);
    }

    /**
     * DELETE Template to be inherited.
     */
    public function delete()
    {
        $rep = $this->getResponse('json');

        return Error::setError($rep, 501);
    }
}
